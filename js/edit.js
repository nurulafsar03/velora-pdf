(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const pageNumInput = document.getElementById('pageNum');
  const pageOfEl = document.getElementById('pageOf');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const addTextBtn = document.getElementById('addTextBtn');
  const addWhiteoutBtn = document.getElementById('addWhiteoutBtn');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const workspace = document.getElementById('workspace');
  const previewWrap = document.getElementById('previewWrap');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');

  const COLORS = ['#16140f', '#6f97c9', '#c1502e'];
  const WHITEOUT_COLORS = ['#ffffff', '#16140f', '#ede6d6'];
  const GH = 'https://raw.githubusercontent.com/google/fonts/main';

  // Each custom entry's urls give the exact files that exist; missing
  // bold/italic variants simply reuse the closest available file, both
  // for the live preview (browser fake-bold/italic) and for the final
  // embedded PDF (falls back to the nearest real style).
  const FONT_CATALOG = [
    { key: 'Helvetica', label: 'Helvetica', category: 'Sans', standard: true },
    { key: 'Lato', label: 'Lato', category: 'Sans', urls: { r: `${GH}/ofl/lato/Lato-Regular.ttf`, b: `${GH}/ofl/lato/Lato-Bold.ttf`, i: `${GH}/ofl/lato/Lato-Italic.ttf`, bi: `${GH}/ofl/lato/Lato-BoldItalic.ttf` } },
    { key: 'Poppins', label: 'Poppins', category: 'Sans', urls: { r: `${GH}/ofl/poppins/Poppins-Regular.ttf`, b: `${GH}/ofl/poppins/Poppins-Bold.ttf`, i: `${GH}/ofl/poppins/Poppins-Italic.ttf`, bi: `${GH}/ofl/poppins/Poppins-BoldItalic.ttf` } },

    { key: 'TimesRoman', label: 'Times', category: 'Serif', standard: true },
    { key: 'PTSerif', label: 'PT Serif', category: 'Serif', urls: { r: `${GH}/ofl/ptserif/PT_Serif-Web-Regular.ttf`, b: `${GH}/ofl/ptserif/PT_Serif-Web-Bold.ttf`, i: `${GH}/ofl/ptserif/PT_Serif-Web-Italic.ttf`, bi: `${GH}/ofl/ptserif/PT_Serif-Web-BoldItalic.ttf` } },

    { key: 'Courier', label: 'Courier', category: 'Monospace', standard: true },
    { key: 'CourierPrime', label: 'Courier Prime', category: 'Monospace', urls: { r: `${GH}/ofl/courierprime/CourierPrime-Regular.ttf`, b: `${GH}/ofl/courierprime/CourierPrime-Bold.ttf`, i: `${GH}/ofl/courierprime/CourierPrime-Italic.ttf`, bi: `${GH}/ofl/courierprime/CourierPrime-BoldItalic.ttf` } },
    { key: 'SpaceMono', label: 'Space Mono', category: 'Monospace', urls: { r: `${GH}/ofl/spacemono/SpaceMono-Regular.ttf`, b: `${GH}/ofl/spacemono/SpaceMono-Bold.ttf`, i: `${GH}/ofl/spacemono/SpaceMono-Italic.ttf`, bi: `${GH}/ofl/spacemono/SpaceMono-BoldItalic.ttf` } },
    { key: 'FiraMono', label: 'Fira Mono', category: 'Monospace', urls: { r: `${GH}/ofl/firamono/FiraMono-Regular.ttf`, b: `${GH}/ofl/firamono/FiraMono-Bold.ttf` } },

    { key: 'Kalam', label: 'Kalam', category: 'Handwriting', urls: { r: `${GH}/ofl/kalam/Kalam-Regular.ttf`, b: `${GH}/ofl/kalam/Kalam-Bold.ttf` } },
    { key: 'IndieFlower', label: 'Indie Flower', category: 'Handwriting', urls: { r: `${GH}/ofl/indieflower/IndieFlower-Regular.ttf` } },
    { key: 'ArchitectsDaughter', label: 'Architects Daughter', category: 'Handwriting', urls: { r: `${GH}/ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf` } },
    { key: 'Pacifico', label: 'Pacifico', category: 'Handwriting', urls: { r: `${GH}/ofl/pacifico/Pacifico-Regular.ttf` } },
    { key: 'GreatVibes', label: 'Great Vibes', category: 'Handwriting', urls: { r: `${GH}/ofl/greatvibes/GreatVibes-Regular.ttf` } },

    { key: 'BebasNeue', label: 'Bebas Neue', category: 'Display', urls: { r: `${GH}/ofl/bebasneue/BebasNeue-Regular.ttf` } },
    { key: 'Anton', label: 'Anton', category: 'Display', urls: { r: `${GH}/ofl/anton/Anton-Regular.ttf` } },
    { key: 'AbrilFatface', label: 'Abril Fatface', category: 'Display', urls: { r: `${GH}/ofl/abrilfatface/AbrilFatface-Regular.ttf` } },
    { key: 'Righteous', label: 'Righteous', category: 'Display', urls: { r: `${GH}/ofl/righteous/Righteous-Regular.ttf` } },
    { key: 'Lobster', label: 'Lobster', category: 'Display', urls: { r: `${GH}/ofl/lobster/Lobster-Regular.ttf` } },
    { key: 'OleoScript', label: 'Oleo Script', category: 'Display', urls: { r: `${GH}/ofl/oleoscript/OleoScript-Regular.ttf`, b: `${GH}/ofl/oleoscript/OleoScript-Bold.ttf` } },

    { key: 'HindSiliguri', label: 'Hind Siliguri (বাংলা)', category: 'Bengali', urls: { r: `${GH}/ofl/hindsiliguri/HindSiliguri-Regular.ttf`, b: `${GH}/ofl/hindsiliguri/HindSiliguri-Bold.ttf` } },
  ];

  function catalogEntry(key) {
    return FONT_CATALOG.find((f) => f.key === key) || FONT_CATALOG[0];
  }

  function cssFontFamily(entry) {
    if (entry.standard) {
      if (entry.key === 'Helvetica') return 'Helvetica, Arial, sans-serif';
      if (entry.key === 'TimesRoman') return "'Times New Roman', Times, serif";
      if (entry.key === 'Courier') return "'Courier New', Courier, monospace";
    }
    const fallback = entry.category === 'Serif' ? 'serif' : entry.category === 'Monospace' ? 'monospace' : 'sans-serif';
    return `'${entry.label}', ${fallback}`;
  }

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
    addTextBtn.disabled = true;
    addWhiteoutBtn.disabled = true;
    setStatus(`loading page ${pageNum}…`);

    try {
      const page = await pdfDocProxy.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });

      // Cap the rendered resolution so very large scanned pages don't
      // blow past canvas memory limits and silently fail to render.
      const MAX_DIM = 1700;
      const longEdge = Math.max(baseViewport.width, baseViewport.height);
      const scale = Math.max(0.3, Math.min(1.3, MAX_DIM / longEdge));

      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

      previewWrap.innerHTML = '';
      previewWrap.style.minHeight = '';
      previewWrap.appendChild(canvas);
      renderPageElements();
      addTextBtn.disabled = false;
      addWhiteoutBtn.disabled = false;
      setStatus('add text or a whiteout box, then download');
      return true;
    } catch (err) {
      console.error('Failed to render page', pageNum, err);
      previewWrap.innerHTML = '';
      previewWrap.style.minHeight = '200px';
      setStatus(`couldn't render page ${pageNum} — try a different page, or a smaller/re-saved copy of this PDF`);
      return false;
    }
  }

  function renderPageElements() {
    previewWrap.querySelectorAll('.edit-el').forEach((el) => el.remove());
    edits.filter((e) => e.pageNum === currentPage).forEach((edit) => {
      if (edit.type === 'text') createTextDom(edit);
      else createWhiteoutDom(edit);
    });
  }

  previewWrap.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.edit-el')) {
      previewWrap.querySelectorAll('.edit-el').forEach((n) => n.classList.remove('active'));
    }
  });
  previewWrap.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.edit-el')) {
      previewWrap.querySelectorAll('.edit-el').forEach((n) => n.classList.remove('active'));
    }
  });

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
    el.style.maxWidth = `${Math.max(10, 98 - edit.xPct)}%`;

    const strip = document.createElement('div');
    strip.className = 'drag-strip';
    el.appendChild(strip);

    const content = document.createElement('div');
    content.className = 'text-content';
    content.contentEditable = 'true';
    content.spellcheck = false;
    content.textContent = edit.text;
    content.style.color = edit.color;
    content.style.fontSize = `${edit.fontSizePct * 5}px`;
    content.style.fontFamily = cssFontFamily(catalogEntry(edit.fontFamily));
    content.style.fontWeight = edit.bold ? '700' : '400';
    content.style.fontStyle = edit.italic ? 'italic' : 'normal';
    content.addEventListener('input', () => {
      edit.text = content.textContent;
    });
    content.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.execCommand('insertText', false, '\n');
      }
    });
    content.addEventListener('mousedown', (e) => e.stopPropagation());
    content.addEventListener('touchstart', (e) => e.stopPropagation());
    el.appendChild(content);

    const controls = document.createElement('div');
    controls.className = 'el-controls';

    const smallerBtn = document.createElement('button');
    smallerBtn.textContent = 'A-';
    smallerBtn.title = 'Smaller';
    const biggerBtn = document.createElement('button');
    biggerBtn.textContent = 'A+';
    biggerBtn.title = 'Bigger';
    const boldBtn = document.createElement('button');
    boldBtn.textContent = 'B';
    boldBtn.style.fontWeight = '700';
    boldBtn.title = 'Bold';
    boldBtn.classList.toggle('toggled', !!edit.bold);
    const italicBtn = document.createElement('button');
    italicBtn.textContent = 'I';
    italicBtn.style.fontStyle = 'italic';
    italicBtn.title = 'Italic';
    italicBtn.classList.toggle('toggled', !!edit.italic);

    smallerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.fontSizePct = Math.max(1, edit.fontSizePct - 0.4);
      content.style.fontSize = `${edit.fontSizePct * 5}px`;
    });
    biggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.fontSizePct = Math.min(12, edit.fontSizePct + 0.4);
      content.style.fontSize = `${edit.fontSizePct * 5}px`;
    });
    boldBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.bold = !edit.bold;
      content.style.fontWeight = edit.bold ? '700' : '400';
      boldBtn.classList.toggle('toggled', edit.bold);
    });
    italicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      edit.italic = !edit.italic;
      content.style.fontStyle = edit.italic ? 'italic' : 'normal';
      italicBtn.classList.toggle('toggled', edit.italic);
    });

    controls.appendChild(smallerBtn);
    controls.appendChild(biggerBtn);

    const sepFont = document.createElement('div');
    sepFont.className = 'ctrl-sep';
    controls.appendChild(sepFont);

    const fontSelect = document.createElement('select');
    fontSelect.className = 'font-select';
    const categories = [...new Set(FONT_CATALOG.map((f) => f.category))];
    categories.forEach((cat) => {
      const group = document.createElement('optgroup');
      group.label = cat;
      FONT_CATALOG.filter((f) => f.category === cat).forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f.key;
        opt.textContent = f.label;
        if (f.key === edit.fontFamily) opt.selected = true;
        group.appendChild(opt);
      });
      fontSelect.appendChild(group);
    });
    fontSelect.addEventListener('click', (e) => e.stopPropagation());
    fontSelect.addEventListener('change', () => {
      edit.fontFamily = fontSelect.value;
      content.style.fontFamily = cssFontFamily(catalogEntry(edit.fontFamily));
    });
    controls.appendChild(fontSelect);

    const sepBI = document.createElement('div');
    sepBI.className = 'ctrl-sep';
    controls.appendChild(sepBI);

    controls.appendChild(boldBtn);
    controls.appendChild(italicBtn);

    const sep1 = document.createElement('div');
    sep1.className = 'ctrl-sep';
    controls.appendChild(sep1);

    COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        content.style.color = c;
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
        colorPicker.value = c;
      });
      controls.appendChild(sw);
    });

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = edit.color;
    colorPicker.title = 'Custom color';
    colorPicker.addEventListener('input', (e) => {
      edit.color = e.target.value;
      content.style.color = edit.color;
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    colorPicker.addEventListener('click', (e) => e.stopPropagation());
    controls.appendChild(colorPicker);

    const sep2 = document.createElement('div');
    sep2.className = 'ctrl-sep';
    controls.appendChild(sep2);

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

    wireDrag(strip, edit, () => {
      el.style.left = `${edit.xPct}%`;
      el.style.top = `${edit.yPct}%`;
      el.style.maxWidth = `${Math.max(10, 98 - edit.xPct)}%`;
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
    el.style.background = edit.color;

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

    const controls = document.createElement('div');
    controls.className = 'wo-controls';

    WHITEOUT_COLORS.forEach((c) => {
      const sw = document.createElement('span');
      sw.className = 'mini-swatch' + (c === edit.color ? ' selected' : '');
      sw.style.background = c;
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        edit.color = c;
        el.style.background = c;
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.toggle('selected', s === sw));
        colorPicker.value = c;
      });
      controls.appendChild(sw);
    });

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.value = edit.color;
    colorPicker.title = 'Custom color';
    colorPicker.addEventListener('input', (e) => {
      edit.color = e.target.value;
      el.style.background = edit.color;
      controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
    });
    colorPicker.addEventListener('click', (e) => e.stopPropagation());
    colorPicker.addEventListener('mousedown', (e) => e.stopPropagation());
    controls.appendChild(colorPicker);

    const eyedropperBtn = document.createElement('button');
    eyedropperBtn.type = 'button';
    eyedropperBtn.className = 'eyedropper-btn';
    eyedropperBtn.title = window.EyeDropper ? 'Pick a color from anywhere on screen' : 'Not supported in this browser (try Chrome or Edge)';
    eyedropperBtn.textContent = '💧';
    eyedropperBtn.disabled = !window.EyeDropper;
    eyedropperBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    eyedropperBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!window.EyeDropper) return;
      try {
        const result = await new window.EyeDropper().open();
        edit.color = result.sRGBHex;
        el.style.background = edit.color;
        colorPicker.value = edit.color;
        controls.querySelectorAll('.mini-swatch').forEach((s) => s.classList.remove('selected'));
      } catch (err) {
        // user cancelled the picker — nothing to do
      }
    });
    controls.appendChild(eyedropperBtn);

    el.appendChild(controls);

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
      fontSizePct: 5.5,
      fontFamily: 'Helvetica',
      bold: false,
      italic: false,
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
      color: '#ffffff',
    };
    edits.push(edit);
    renderPageElements();
    validateDownload();
  });

  async function goToPage(n) {
    n = Math.max(1, Math.min(pageCount, n));
    const ok = await renderBasePage(n);
    if (ok) {
      currentPage = n;
      pageNumInput.value = n;
    } else {
      pageNumInput.value = currentPage;
    }
  }

  pageNumInput.addEventListener('change', () => {
    const n = parseInt(pageNumInput.value, 10) || currentPage;
    goToPage(n);
  });
  prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));

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
      pdfDoc.registerFontkit(fontkit);
      const pages = pdfDoc.getPages();

      const STANDARD_SETS = {
        Helvetica: [StandardFonts.Helvetica, StandardFonts.HelveticaBold, StandardFonts.HelveticaOblique, StandardFonts.HelveticaBoldOblique],
        TimesRoman: [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.TimesRomanBoldItalic],
        Courier: [StandardFonts.Courier, StandardFonts.CourierBold, StandardFonts.CourierOblique, StandardFonts.CourierBoldOblique],
      };

      const embeddedCache = {}; // fontFamily key -> [regular, bold, italic, boldItalic] embedded font objects
      let anyFontFailed = false;

      async function getEmbeddedSet(familyKey) {
        if (embeddedCache[familyKey]) return embeddedCache[familyKey];

        const entry = catalogEntry(familyKey);
        if (entry.standard) {
          const set = await Promise.all(STANDARD_SETS[entry.key].map((f) => pdfDoc.embedFont(f)));
          embeddedCache[familyKey] = set;
          return set;
        }

        try {
          const order = ['r', 'b', 'i', 'bi'];
          const bytesList = await Promise.all(
            order.map((k) => {
              const url = entry.urls[k] || entry.urls.r;
              return fetch(url).then((res) => {
                if (!res.ok) throw new Error(`fetch failed: ${url}`);
                return res.arrayBuffer();
              });
            })
          );
          const set = await Promise.all(bytesList.map((bytes) => pdfDoc.embedFont(bytes, { subset: true })));
          embeddedCache[familyKey] = set;
          return set;
        } catch (err) {
          console.error(`Could not load font "${entry.label}", using Helvetica instead`, err);
          anyFontFailed = true;
          const fallback = await getEmbeddedSet('Helvetica');
          embeddedCache[familyKey] = fallback;
          return fallback;
        }
      }

      async function pickFont(edit) {
        const set = await getEmbeddedSet(edit.fontFamily);
        const idx = (edit.bold ? 1 : 0) + (edit.italic ? 2 : 0);
        return set[idx];
      }

      function hexToRgb(hex) {
        const n = parseInt(hex.replace('#', ''), 16);
        return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
      }

      function wrapLines(text, font, fontSize, maxWidth) {
        const lines = [];
        text.split('\n').forEach((paragraph) => {
          const words = paragraph.split(' ');
          let current = '';
          words.forEach((word) => {
            const candidate = current ? `${current} ${word}` : word;
            if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
              lines.push(current);
              current = word;
            } else {
              current = candidate;
            }
          });
          lines.push(current);
        });
        return lines;
      }

      const BENGALI_RANGE = /[\u0980-\u09FF]/;
      let skippedCount = 0;

      for (const edit of edits) {
        const page = pages[edit.pageNum - 1];
        if (!page) continue;
        const { width, height } = page.getSize();

        try {
          if (edit.type === 'whiteout') {
            const x = width * (edit.xPct / 100);
            const boxWidth = width * (edit.widthPct / 100);
            const boxHeight = height * (edit.heightPct / 100);
            const y = height - height * (edit.yPct / 100) - boxHeight;
            const { r, g, b } = hexToRgb(edit.color || '#ffffff');
            page.drawRectangle({ x, y, width: boxWidth, height: boxHeight, color: rgb(r, g, b) });
          } else if (edit.type === 'text' && edit.text.trim()) {
            const fontSize = width * (edit.fontSizePct / 100);
            const { r, g, b } = hexToRgb(edit.color);
            const effectiveFamily = BENGALI_RANGE.test(edit.text) ? 'HindSiliguri' : edit.fontFamily;
            const font = await pickFont({ ...edit, fontFamily: effectiveFamily });
            const x = width * (edit.xPct / 100);
            const maxWidth = Math.max(fontSize * 3, width - x);
            const lineHeight = fontSize * 1.25;
            const lines = wrapLines(edit.text, font, fontSize, maxWidth);
            let y = height - height * (edit.yPct / 100) - fontSize;
            lines.forEach((line) => {
              page.drawText(line, { x, y, size: fontSize, font, color: rgb(r, g, b) });
              y -= lineHeight;
            });
          }
        } catch (editErr) {
          console.error('Skipped one edit that failed to render', edit, editErr);
          skippedCount += 1;
        }
      }

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

      const warnings = [];
      if (anyFontFailed) warnings.push("some fonts couldn't load and were substituted");
      if (skippedCount) warnings.push(`${skippedCount} edit${skippedCount > 1 ? 's' : ''} couldn't be applied`);
      setStatus(warnings.length ? `done — downloaded (${warnings.join('; ')})` : 'done — edited file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('failed — check the console');
    } finally {
      validateDownload();
    }
  });
})();
