// Paste in the DevTools console of http://localhost:4200/search/battery (the app, with your real data loaded),
// while `python3 brag/scripts/capture/dump-receiver.py` is running. Saves your items + the visible photo urls
// into brag/.local/dump/ (git-ignored : it is your personal inventory).
const items = await new Promise((resolve, reject) => {
  const r = indexedDB.open('stuff-finder')
  r.onsuccess = () => {
    const tx = r.result.transaction(['items'], 'readonly')
    const all = tx.objectStore('items').getAll()
    tx.oncomplete = () => resolve(all.result)
    tx.onerror = () => reject(tx.error)
  }
  r.onerror = () => reject(r.error)
})
const send = (name, data) => fetch('http://127.0.0.1:5055/' + name, { method: 'POST', mode: 'no-cors', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(data) })
await send('items', items)
await send('imgs', [...document.querySelectorAll('img')].map((el, i) => ({ i, src: el.src, alt: el.alt })))
console.log('dumped', items.length, 'items')
