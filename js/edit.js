(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const pageNumInput = document.getElementById('pageNum');
  const pageOfEl = document.getElementById('pageOf');
  const addTextBtn = document.getElementById('addTextBtn');
  const addWhiteoutBtn = document.getElementById('addWhiteoutBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const workspace = document.getElementById('workspace');
  const previewWrap = document.getElementById('previewWrap');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');

  const COLORS = ['#16140f', '#6f97c9', '#c1502e'];

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';
  let pdfDocProxy = null;
  let pageCount = 0;
  let currentPage = 1;
  let edits = []; // { id, type, pageNum, xPct, yPct, widthPct, heightPct, text, color, fontSizePct }
  let idCounter = 0;
  let activeEl = null;

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pdf$/i, ''); }
  function newId() { return `e${++idCounter}`; }

  function validateDownload() {
    downloadBtn.disabled = edits.length === 0;
  }

  // ---- rendering base page ----

  async function renderBasePage(pageNum) {
    const page = await pdfDocProxy.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.3 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    previewWrap.innerHTML = '';
    previewWrap.appendChild(canvas);
    renderPageElements();
  }

  function renderPageElements() {
    previewWrap.querySelectorAll('.edit-el').forEach((el) => el.remove());
    edits.filter((e) => e.pageNum === currentPage).forEach((edit) => {
      if (edit.type === 'text') createTextDom(edit);
      else createWhiteoutDom(edit);
    });
  }

  // ---- drag helper (shared) ----

  function wireDrag(el, edit, onMove) {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    function down(e) {
      if (e.target.closest('input, button, .resize-handle')) return;
      dragging = true;
      activeEl = el;
      document.querySelectorAll('.edit-el').forEach((n) => n.classList.remove('active'));
      el.classList.add('active');
      const rect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      offsetX = clientX - rect.left - (edit.xPct / 100) * rect.width;
      offsetY = clientY - rect.top - (edit.yPct / 100) * rect.height;
      e.stopPropagation();
    }
    function move(e) {
      if (!dragging) return;
      const rect = previewWrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      edit.xPct = Math.max(0, Math.min(98, ((clientX - rect.left - offsetX) / rect.width) * 100));
      edit.yPct = Math.max(0, Math.min(98, ((clientY - rect.top - offsetY) / rect.height) * 100));
      onMove();
    }
    function up() { dragging = false; }

    el.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    el.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }

  // ---- text elements ----

  function createTextDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el text-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = '40%';

    const strip = document.createElement('div');
    strip.className = 'drag-strip';
    el.appendChild(strip);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = edit.text;
    input.style.color = edit.color;
    input.style.fontSize = `${edit.fontSizePct * 5}px`;
    input.addEventListener('input', () => { edit.text = input.value; });
    el.appendChild(input);

    const controls = document.createElement('div');
    controls.className = 'el-controls';
    controls.innerHTML = `
      <button data-act="smaller" title="Smaller">A-</button>
      <button data-act="bigger" title="Bigger">A+</button>
    `;
    COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        input.style.color = c;
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
      });
      controls.appendChild(sw);
    });
    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    controls.appendChild(delBtn);
    el.appendChild(controls);

    controls.addEventListener('click', (e) => {
      const act = e.target.dataset.act;
      if (act === 'smaller') edit.fontSizePct = Math.max(1, edit.fontSizePct - 0.4);
      if (act === 'bigger') edit.fontSizePct = Math.min(12, edit.fontSizePct + 0.4);
      input.style.fontSize = `${edit.fontSizePct * 5}px`;
    });

    wireDrag(strip, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    previewWrap.appendChild(el);
  }

  // ---- whiteout elements ----

  function createWhiteoutDom(edit) {
    const el = document.createElement('div');
    el.className = 'edit-el whiteout-el';
    el.style.left = `${edit.xPct}%`;
    el.style.top = `${edit.yPct}%`;
    el.style.width = `${edit.widthPct}%`;
    el.style.height = `${edit.heightPct}%`;

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn-box';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edits = edits.filter((x) => x.id !== edit.id);
      renderPageElements();
      validateDownload();
    });
    el.appendChild(delBtn);

    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    el.appendChild(handle);

    wireDrag(el, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
    });

    let resizing = false;
    handle.addEventListener('mousedown', (e) => {
      resizing = true;
      e.stopPropagation();
      e.preventDefault();
    });
    handle.addEventListener('touchstart', (e) => {
      resizing = true;
      e.stopPropagation();
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      edit.widthPct = Math.max(3, ((e.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.heightPct = Math.max(2, ((e.clientY - rect.top) / rect.height) * 100 - edit.yPct);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    });
    window.addEventListener('touchmove', (e) => {
      if (!resizing) return;
      const rect = previewWrap.getBoundingClientRect();
      const t = e.touches[0];
      edit.widthPct = Math.max(3, ((t.clientX - rect.left) / rect.width) * 100 - edit.xPct);
      edit.heightPct = Math.max(2, ((t.clientY - rect.top) / rect.height) * 100 - edit.yPct);
      el.style.width = `${edit.widthPct}%`;
      el.style.height = `${edit.heightPct}%`;
    }, { passive: false });
    window.addEventListener('mouseup', () => { resizing = false; });
    window.addEventListener('touchend', () => { resizing = false; });

    previewWrap.appendChild(el);
  }

  // ---- toolbar actions ----

  addTextBtn.addEventListener('click', () => {
    const edit = {
      id: newId(),
      type: 'text',
      pageNum: currentPage,
      xPct: 15,
      yPct: 15,
      text: 'Text',
      color: COLORS[0],
      fontSizePct: 3,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  addWhiteoutBtn.addEventListener('click', () => {
    const edit = {
      id: newId(),
      type: 'whiteout',
      pageNum: currentPage,
      xPct: 15,
      yPct: 15,
      widthPct: 30,
      heightPct: 6,
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  pageNumInput.addEventListener('change', () => {
    let n = parseInt(pageNumInput.value, 10) || 1;
    n = Math.max(1, Math.min(pageCount, n));
    pageNumInput.value = n;
    currentPage = n;
    renderBasePage(n);
  });

  // ---- file loading ----

  async function loadFile(file) {
    setStatus('reading file…');
    previewWrap.innerHTML = '';
    edits = [];

    const arrayBuffer = await file.arrayBuffer();
    sourceArrayBuffer = arrayBuffer;
    sourceFileName = file.name;

    pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    pageCount = pdfDocProxy.numPages;
    currentPage = 1;

    docNameEl.textContent = file.name;
    pageNumInput.value = 1;
    pageNumInput.max = pageCount;
    pageOfEl.textContent = `of ${pageCount}`;

    toolbar.classList.add('active');
    workspace.classList.add('active');
    actionsBar.classList.add('active');

    await renderBasePage(1);
    validateDownload();
    setStatus('add text or a whiteout box, then download');
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
    sourceArrayBuffer = null;
    pdfDocProxy = null;
    pageCount = 0;
    edits = [];
    previewWrap.innerHTML = '';
    toolbar.classList.remove('active');
    workspace.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  // ---- download ----

  downloadBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer || !edits.length) return;
    downloadBtn.disabled = true;
    setStatus('applying edits…');

    try {
      const { PDFDocument, StandardFonts, rgb } = PDFLib;
      const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0));
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      function hexToRgb(hex) {
        const n = parseInt(hex.replace('#', ''), 16);
        return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
      }

      edits.forEach((edit) => {
        const page = pages[edit.pageNum - 1];
        if (!page) return;
        const { width, height } = page.getSize();

        if (edit.type === 'whiteout') {
          const x = width * (edit.xPct / 100);
          const boxWidth = width * (edit.widthPct / 100);
          const boxHeight = height * (edit.heightPct / 100);
          const y = height - height * (edit.yPct / 100) - boxHeight;
          page.drawRectangle({ x, y, width: boxWidth, height: boxHeight, color: rgb(1, 1, 1) });
        } else if (edit.type === 'text' && edit.text.trim()) {
          const fontSize = width * (edit.fontSizePct / 100);
          const { r, g, b } = hexToRgb(edit.color);
          const x = width * (edit.xPct / 100);
          const y = height - height * (edit.yPct / 100) - fontSize;
          page.drawText(edit.text, { x, y, size: fontSize, font, color: rgb(r, g, b) });
        }
      });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-edited.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — edited file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check the console');
    } finally {
      validateDownload();
    }
  });
})();
