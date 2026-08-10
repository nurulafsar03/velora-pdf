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

  const QUICK_TOOLS = [
    { url: 'edit.html', labelKey: 'edit_title', fallback: 'Edit PDF' },
    { url: 'merge.html', labelKey: 'home_tool_merge_title', fallback: 'Merge PDF' },
    { url: 'split.html', labelKey: 'home_tool_split_title', fallback: 'Split PDF' },
    { url: 'rotate.html', labelKey: 'home_tool_rotate_title', fallback: 'Rotate PDF' },
    { url: 'organize.html', labelKey: 'home_tool_organize_title', fallback: 'Organize Pages' },
    { url: 'watermark.html', labelKey: 'home_tool_watermark_title', fallback: 'Watermark' },
    { url: 'protect.html', labelKey: 'home_tool_protect_title', fallback: 'Protect PDF' },
    { url: 'sign.html', labelKey: 'home_tool_sign_title', fallback: 'Sign PDF' },
    { url: 'compress.html', labelKey: 'home_tool_compress_title', fallback: 'Compress PDF' },
    { url: 'pdf2jpg.html', labelKey: 'home_tool_pdf2jpg_title', fallback: 'PDF to JPG' },
  ];

  let currentArrayBuffer = null;
  let currentFileName = 'document.pdf';

  function buildQuickActions() {
    quickActions.querySelectorAll('.qa-btn').forEach((b) => b.remove());
    QUICK_TOOLS.forEach((tool) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qa-btn';
      btn.textContent = (window.veloraT && window.veloraT(tool.labelKey)) || tool.fallback;
      btn.addEventListener('click', () => {
        if (!currentArrayBuffer) return;
        setStatus('opening…');
        window.VeloraHandoff.navigateWithFile(currentArrayBuffer, currentFileName, tool.url);
      });
      quickActions.appendChild(btn);
    });
    quickActions.classList.add('active');
  }

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
      buildQuickActions();

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
    quickActions.classList.remove('active');
    currentArrayBuffer = null;
    setStatus('');
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });
})();
