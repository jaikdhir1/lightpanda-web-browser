import express from "express"
import puppeteer from "puppeteer-core"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 3000
const CDP_URL = process.env.CDP_URL || "ws://127.0.0.1:9222"
const NAV_TIMEOUT = Number(process.env.NAV_TIMEOUT || 30000)

const app = express()
app.use(express.json())
app.use(express.static(join(__dirname, "public")))

function normalizeUrl(raw) {
	let u = String(raw || "").trim()
	if (!u) return null
	if (!/^https?:\/\//i.test(u)) {
		// If it looks like a domain, prefix https://, otherwise treat as a search.
		if (/^[\w-]+(\.[\w-]+)+.*$/.test(u) || u.startsWith("localhost")) {
			u = "https://" + u
		} else {
			u = "https://duckduckgo.com/html/?q=" + encodeURIComponent(u)
		}
	}
	try {
		return new URL(u).toString()
	} catch {
		return null
	}
}

// Inject a <base> tag so the iframe can resolve relative CSS/img/links
// against the original origin (Lightpanda ignores CSS/images itself).
function injectBase(html, baseUrl) {
	const baseTag = `<base href="${baseUrl}">`
	if (/<head[^>]*>/i.test(html)) {
		return html.replace(/<head[^>]*>/i, (m) => m + baseTag)
	}
	if (/<html[^>]*>/i.test(html)) {
		return html.replace(/<html[^>]*>/i, (m) => m + "<head>" + baseTag + "</head>")
	}
	return baseTag + html
}

// Primary path: render via Lightpanda's CDP server using the documented
// createBrowserContext() -> context.newPage() pattern.
async function renderWithLightpanda(url) {
	const browser = await puppeteer.connect({ browserWSEndpoint: CDP_URL })
	let context
	try {
		context = await browser.createBrowserContext()
		const page = await context.newPage()
		await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT })
		const html = await page.content()
		const finalUrl = page.url() || url
		await page.close().catch(() => {})
		return { html, finalUrl }
	} finally {
		if (context) await context.close().catch(() => {})
		await browser.disconnect().catch(() => {})
	}
}

// Fallback: plain server-side fetch (no JS execution) if Lightpanda is down.
async function renderDirect(url) {
	const res = await fetch(url, {
		headers: { "User-Agent": "Mozilla/5.0 (compatible; LightpandaWebBrowser/1.0)" },
	})
	const html = await res.text()
	return { html, finalUrl: res.url || url }
}

app.post("/api/navigate", async (req, res) => {
	const url = normalizeUrl(req.body && req.body.url)
	if (!url) {
		return res.status(400).json({ error: "Invalid URL" })
	}

	let engine = "lightpanda"
	let result
	try {
		result = await renderWithLightpanda(url)
	} catch (err) {
		try {
			result = await renderDirect(url)
			engine = "direct"
		} catch (err2) {
			return res.status(502).json({
				error: "Failed to load page",
				detail: String((err2 && err2.message) || err2),
				lightpandaError: String((err && err.message) || err),
			})
		}
	}

	const html = injectBase(result.html, result.finalUrl)
	res.json({ engine, finalUrl: result.finalUrl, html })
})

app.get("/api/health", async (_req, res) => {
	try {
		const browser = await puppeteer.connect({ browserWSEndpoint: CDP_URL })
		await browser.disconnect().catch(() => {})
		res.json({ ok: true, engine: "lightpanda", cdp: CDP_URL })
	} catch (err) {
		res.json({ ok: false, engine: "direct", cdp: CDP_URL, detail: String((err && err.message) || err) })
	}
})

app.listen(PORT, () => {
	console.log(`Lightpanda web browser listening on http://localhost:${PORT}`)
	console.log(`Connecting to Lightpanda CDP at ${CDP_URL}`)
})
