const urlInput = document.getElementById("url")
const bar = document.getElementById("bar")
const view = document.getElementById("view")
const welcome = document.getElementById("welcome")
const engineEl = document.getElementById("engine")
const statusEl = document.getElementById("status")
const backBtn = document.getElementById("back")
const forwardBtn = document.getElementById("forward")
const reloadBtn = document.getElementById("reload")

const history = []
let pos = -1

function setStatus(msg, isError) {
  statusEl.textContent = msg || ""
  statusEl.classList.toggle("show", !!msg)
  statusEl.classList.toggle("error", !!isError)
}

function setEngine(engine) {
  engineEl.textContent = engine
  engineEl.className = "engine" + (engine === "lightpanda" || engine === "direct" ? " " + engine : "")
}

async function navigate(rawUrl, fromHistory) {
  const url = (rawUrl || "").trim()
  if (!url) return
  setStatus("Loading " + url + " ...")
  setEngine("loading")
  try {
    const res = await fetch("/api/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to load")
    welcome.hidden = true
    view.hidden = false
    view.srcdoc = data.html
    urlInput.value = data.url
    setEngine(data.engine)
    setStatus(data.notice ? "Loaded with fallback: " + data.notice : "")
    if (!fromHistory) {
      history.splice(pos + 1)
      history.push(data.url)
      pos = history.length - 1
    }
    updateNavButtons()
  } catch (err) {
    setEngine("error")
    setStatus(String(err.message || err), true)
  }
}

function updateNavButtons() {
  backBtn.disabled = pos <= 0
  forwardBtn.disabled = pos >= history.length - 1
}

bar.addEventListener("submit", (e) => {
  e.preventDefault()
  navigate(urlInput.value)
})

backBtn.addEventListener("click", () => {
  if (pos > 0) { pos--; navigate(history[pos], true) }
})
forwardBtn.addEventListener("click", () => {
  if (pos < history.length - 1) { pos++; navigate(history[pos], true) }
})
reloadBtn.addEventListener("click", () => {
  if (pos >= 0) navigate(history[pos], true)
})

document.querySelectorAll(".shortcuts button").forEach((b) => {
  b.addEventListener("click", () => navigate(b.dataset.url))
})

window.addEventListener("message", (e) => {
  if (e.data && e.data.type === "lp-navigate" && e.data.url) navigate(e.data.url)
})

updateNavButtons()
