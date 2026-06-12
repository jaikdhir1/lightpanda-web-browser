import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import puppeteer from "puppeteer-core"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3000
const CDP_URL = process.env.CDP_URL || "ws://127.0.0.1:9222"
const NAV_TIMEOUT = Number(process.env.NAV_TIMEOUT || 30000)

const app = express()
app.use(express.json())
app.use(express.static(join(__dirname, "public")))

function normalizeUrl(input) {
  let url = (input || "").trim()
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) url = "https://" + url
  try {
    return new URL(url).toString()
  } catch {
    return null
  }
}

function injectBase(html, baseUrl) {
  const baseTag = `<base href="${baseUrl}">`
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + baseTag)
  return baseTag + html
}

async function renderWithLightpanda(url) {
  const browser = await puppeteer.connect({ browserWSEndpoint: CDP_URL })
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT })
    const html = await page.content()
    await page.close()
    return html
  } finally {
    await browser.disconnect()
  }
}

async function renderDirect(url) {
  const res = await fetch(url, { redirect: "follow" })
  return await res.text()
}

app.post("/api/navigate", async (req, res) => {
  const url = normalizeUrl(req.body && req.body.url)
  if (!url) return res.status(400).json({ error: "Invalid URL" })
  try {
    const html = await renderWithLightpanda(url)
    return res.json({ url, engine: "lightpanda", html: injectBase(html, url) })
  } catch (err) {
    try {
      const html = await renderDirect(url)
      return res.json({ url, engine: "direct", html: injectBase(html, url), notice: String((err && err.message) || err) })
    } catch (err2) {
      return res.status(502).json({ error: "Failed to load page", detail: String((err2 && err2.message) || err2) })
    }
  }
})

app.get("/api/health", async (req, res) => {
  let lightpanda = false
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: CDP_URL })
    await browser.disconnect()
    lightpanda = true
  } catch {}
  res.json({ ok: true, lightpanda })
})

app.listen(PORT, () => {
  console.log(`Lightpanda web browser running on http://localhost:${PORT}`)
})
