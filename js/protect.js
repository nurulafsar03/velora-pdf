(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const workspace = document.getElementById('workspace');
  const docNameEl = document.getElementById('docName');
  const pw1 = document.getElementById('pw1');
  const pw2 = document.getElementById('pw2');
  const mismatchNote = document.getElementById('mismatchNote');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const changeFileBtn = document.getElementById('changeFileBtn');

  let sourceArrayBuffer = null;
  let sourceFileName = 'document';

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function validate() {
    const a = pw1.value;
    const b = pw2.value;
    const bothFilled = a.length > 0 && b.length > 0;
    const match = a === b;
    const longEnough = a.length >= 4;

    mismatchNote.classList.toggle('visible', bothFilled && !match);
    downloadBtn.disabled = !(bothFilled && match && longEnough);
  }

  pw1.addEventListener('input', validate);
  pw2.addEventListener('input', validate);

  async function loadFile(file) {
    setStatus('reading file…');
    sourceArrayBuffer = await file.arrayBuffer();
    sourceFileName = file.name;

    docNameEl.textContent = file.name;
    workspace.classList.add('active');
    actionsBar.classList.add('active');
    pw1.value = '';
    pw2.value = '';
    validate();
    setStatus('set a password, then download');
    pw1.focus();
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
    workspace.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!sourceArrayBuffer || pw1.value !== pw2.value || pw1.value.length < 4) return;
    downloadBtn.disabled = true;
    setStatus('encrypting…');

    try {
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.load(sourceArrayBuffer.slice(0));

      await pdfDoc.encrypt({
        userPassword: pw1.value,
        ownerPassword: pw1.value,
      });

      const bytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}-protected.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus('done — password-protected file downloaded');
    } catch (err) {
      console.error(err);
      setStatus('encryption failed — check the console');
    } finally {
      validate();
    }
  });

  if (window.VeloraHandoff) {
    window.VeloraHandoff.checkAndLoad((file) => loadFile(file));
  }
})();
