(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const qualityGroup = document.getElementById('qualityGroup');
  const pageGrid = document.getElementById('pageGrid');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const changeFileBtn = document.getElementById('changeFileBtn');

  const QUALITY = {
    standard: { scale: 1.2, jpegQuality: 0.85 },
    high: { scale: 2.2, jpegQuality: 0.92 },
  };

  let pdfDocProxy = null;
  let sourceFileName = 'document';
  let pageCount = 0;
  let currentQuality = 'standard';

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pdf$/i, ''); }

  qualityGroup.querySelectorAll('.quality-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      currentQuality = opt.dataset.quality;
      qualityGroup.querySelectorAll('.quality-option').forEach((o) => o.classList.toggle('selected', o === opt));
      if (pdfDocProxy) renderThumbnails();
    });
  });

  async function renderThumbnails() {
    pageGrid.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDocProxy.getPage(i);
      // thumbnails always render small regardless of the chosen export quality
      const thumbViewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      canvas.width = thumbViewport.width;
      canvas.height = thumbViewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: thumbViewport }).promise;

      const card = document.createElement('div');
      card.className = 'page-card';
      card.appendChild(canvas);
      const label = document.createElement('div');
      label.className = 'page-num';
      label.textContent = `Page ${i}`;
      card.appendChild(label);
      pageGrid.appendChild(card);
    }
  }

  async function loadFile(file) {
    setStatus('reading file…');
    pageGrid.innerHTML = '';

    const arrayBuffer = await file.arrayBuffer();
    sourceFileName = file.name;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    pageCount = pdfDocProxy.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;

    await renderThumbnails();
    setStatus('choose a quality, then export');
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
    pdfDocProxy = null;
    pageCount = 0;
    pageGrid.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!pdfDocProxy) return;
    downloadBtn.disabled = true;
    const { scale, jpegQuality } = QUALITY[currentQuality];
    const zip = new JSZip();

    try {
      for (let i = 1; i <= pageCount; i++) {
        setStatus(`exporting page ${i} of ${pageCount}…`);
        const page = await pdfDocProxy.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        const base64 = dataUrl.split(',')[1];
        const pageNumPadded = String(i).padStart(String(pageCount).length, '0');
        zip.file(`${baseName(sourceFileName)}-page-${pageNumPadded}.jpg`, base64, { base64: true });
      }

      setStatus('packaging zip…');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-jpg.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — zip downloaded');
    } catch (err) {
      console.error(err);
      setStatus('export failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
