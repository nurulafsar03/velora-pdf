/* ============================================================
   VeloraPDF file handoff
   Lets a tool page pass an already-loaded PDF to another tool
   page without re-uploading. Uses IndexedDB (not sessionStorage)
   so large scanned PDFs aren't limited by storage quota.
   ============================================================ */

window.VeloraHandoff = (() => {
  const DB_NAME = 'velora-handoff';
  const STORE = 'files';

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function store(arrayBuffer, fileName) {
    const db = await openDb();
    const key = `f${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ arrayBuffer, fileName }, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    return key;
  }

  async function retrieve(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const objStore = tx.objectStore(STORE);
      const req = objStore.get(key);
      req.onsuccess = () => {
        const result = req.result;
        objStore.delete(key);
        resolve(result || null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function navigateWithFile(arrayBuffer, fileName, targetUrl) {
    const key = await store(arrayBuffer.slice(0), fileName);
    window.location.href = `${targetUrl}?handoff=${key}`;
  }

  async function checkAndLoad(onFileReady) {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('handoff');
    if (!key) return;
    try {
      const data = await retrieve(key);
      if (data && data.arrayBuffer) {
        const file = new File([data.arrayBuffer], data.fileName || 'document.pdf', { type: 'application/pdf' });
        onFileReady(file);
      }
    } catch (err) {
      console.error('Handoff load failed', err);
    }
    // Clean the URL so a refresh doesn't try to reuse a consumed key.
    window.history.replaceState({}, '', window.location.pathname);
  }

  return { store, retrieve, navigateWithFile, checkAndLoad };
})();
