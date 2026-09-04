(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const pageGrid = document.getElementById('pageGrid');
  const actionsBar = document.getElementById('actionsBar');
  const extractOneBtn = document.getElementById('extractOneBtn');
  const extractZipBtn = document.getElementById('extractZipBtn');
  const statusText = document.getElementById('statusText');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const selectNoneBtn = document.getElementById('selectNoneBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let pageCount = 0;
  let selected = new Set();

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function updateActionState() {
    const has = selected.size > 0;
    extractOneBtn.disabled = !has;
    extractZipBtn.disabled = !has;
    setStatus(has ? `${selected.size} of ${pageCount} pages selected` : `${pageCount} pages · none selected`);
  }

  function togglePage(pageNum, cardEl) {
    if (selected.has(pageNum)) {
      selected.delete(pageNum);
      cardEl.classList.remove('selected');
    } else {
      selected.add(pageNum);
      cardEl.classList.add('selected');
    }
    updateActionState();
  }

  async function loadFile(file) {
    setStatus('reading file…');
    pageGrid.innerHTML = '';
    selected = new Set();

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    pageCount = pdf.numPages;

    docNameEl.textContent = `${file.name} · ${pageCount} pages`;
    toolbar.classList.add('active');
    window.VeloraQuickActions.render(document.getElementById('quickActions'), 'split.html', () => sourceArrayBuffer, () => sourceFileName);
    actionsBar.classList.add('active');

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      const card = document.createElement('div');
      card.className = 'page-card';
      card.innerHTML = `<div class="check">✓</div>`;
      card.appendChild(canvas);
      const label = document.createElement('div');
      label.className = 'page-num';
      label.textContent = `Page ${i}`;
      card.appendChild(label);

      card.addEventListener('click', () => togglePage(i, card));
      pageGrid.appendChild(card);
    }

    updateActionState();
  }

  // ---- drop zone wiring ----

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
    window.VeloraQuickActions.hide(document.getElementById('quickActions'));
    sourceArrayBuffer = null;
    pageCount = 0;
    selected = new Set();
    pageGrid.innerHTML = '';
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  selectAllBtn.addEventListener('click', () => {
    selected = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    document.querySelectorAll('.page-card').forEach((c) => c.classList.add('selected'));
    updateActionState();
  });

  selectNoneBtn.addEventListener('click', () => {
    selected = new Set();
    document.querySelectorAll('.page-card').forEach((c) => c.classList.remove('selected'));
    updateActionState();
  });

  // ---- extraction ----

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  extractOneBtn.addEventListener('click', async () => {
    if (!selected.size) return;
    extractOneBtn.disabled = true;
    setStatus('building PDF…');
    try {
      const { PDFDocument } = PDFLib;
      const srcPdf = await PDFDocument.load(sourceArrayBuffer.slice(0));
      const outPdf = await PDFDocument.create();
      const sortedPages = Array.from(selected).sort((a, b) => a - b);
      const indices = sortedPages.map((n) => n - 1);
      const copiedPages = await outPdf.copyPages(srcPdf, indices);
      copiedPages.forEach((p) => outPdf.addPage(p));
      const bytes = await outPdf.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${baseName(sourceFileName)}-extracted.pdf`);
      setStatus('done — file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('extraction failed — check the console');
    } finally {
      extractOneBtn.disabled = selected.size === 0;
    }
  });

  extractZipBtn.addEventListener('click', async () => {
    if (!selected.size) return;
    extractZipBtn.disabled = true;
    setStatus('building zip…');
    try {
      const { PDFDocument } = PDFLib;
      const zip = new JSZip();
      const sortedPages = Array.from(selected).sort((a, b) => a - b);

      for (const pageNum of sortedPages) {
        const srcPdf = await PDFDocument.load(sourceArrayBuffer.slice(0));
        const outPdf = await PDFDocument.create();
        const [copiedPage] = await outPdf.copyPages(srcPdf, [pageNum - 1]);
        outPdf.addPage(copiedPage);
        const bytes = await outPdf.save();
        zip.file(`${baseName(sourceFileName)}-page-${pageNum}.pdf`, bytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${baseName(sourceFileName)}-pages.zip`);
      setStatus('done — zip downloaded');
    } catch (err) {
      console.error(err);
      setStatus('zip build failed — check the console');
    } finally {
      extractZipBtn.disabled = selected.size === 0;
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
