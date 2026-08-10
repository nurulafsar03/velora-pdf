(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const statusText = document.getElementById('statusText');
  const printBtn = document.getElementById('printBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const viewPagesWrap = document.getElementById('viewPagesWrap');
  const quickActions = document.getElementById('quickActions');

  let currentArrayBuffer = null;
  let currentFileName = 'document.pdf';

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  async function loadFile(file) {
    setStatus('reading file…');
    viewPagesWrap.innerHTML = '';
    printBtn.disabled = true;

    try {
      const arrayBuffer = await file.arrayBuffer();
      currentArrayBuffer = arrayBuffer;
      currentFileName = file.name;
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;

      docNameEl.textContent = `${file.name} · ${doc.numPages} pages`;
      toolbar.classList.add('active');
      window.VeloraQuickActions.render(quickActions, 'view.html', () => currentArrayBuffer, () => currentFileName);

      const dpr = Math.max(2, window.devicePixelRatio || 1);
      for (let i = 1; i <= doc.numPages; i++) {
        setStatus(`rendering page ${i} of ${doc.numPages}…`);
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: dpr });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = 'view-page-canvas';
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        viewPagesWrap.appendChild(canvas);
      }

      printBtn.disabled = false;
      setStatus(`${doc.numPages} pages loaded`);
    } catch (err) {
      console.error(err);
      setStatus("couldn't open this file — is it a valid PDF?");
    }
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    })
  );
  dropzone.addEventListener('drop', (e) => {
    const file = Array.from(e.dataTransfer.files || []).find(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (file) loadFile(file);
  });

  changeFileBtn.addEventListener('click', () => {
    viewPagesWrap.innerHTML = '';
    toolbar.classList.remove('active');
    window.VeloraQuickActions.hide(quickActions);
    currentArrayBuffer = null;
    setStatus('');
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });
})();
