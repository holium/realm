/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
const speed = document.getElementById('speed');
const percent = document.getElementById('percent');
const transferred = document.getElementById('transferred');
const total = document.getElementById('total');

console.log('hi from view-renderer');

window.autoUpdate.listen((event, stats) => {
  speed.innerText = stats.speed;
  percent.innerText = stats.percent;
  transferred.innerText = stats.transferred;
  total.innerText = stats.total;
});
