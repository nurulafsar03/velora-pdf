(() => {
  'use strict';

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const docNameEl = document.getElementById('docName');
  const changeFileBtn = document.getElementById('changeFileBtn');
  const actionsBar = document.getElementById('actionsBar');
  const downloadBtn = document.getElementById('downloadBtn');
  const statusText = document.getElementById('statusText');
  const quickActions = document.getElementById('quickActions');

  const HIND_SILIGURI_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/hindsiliguri/HindSiliguri-Regular.ttf';
  const BENGALI_RANGE = /[\u0980-\u09FF]/;
  const EMU_PER_POINT = 12700;

  let zip = null;
  let sourceFileName = 'presentation.pptx';
  let slideCount = 0;

  function setStatus(msg) { statusText.textContent = msg; }
  function baseName(name) { return name.replace(/\.pptx$/i, ''); }
  function xml(str) { return new DOMParser().parseFromString(str, 'application/xml'); }
  function first(el, tag) { const list = el.getElementsByTagName(tag); return list.length ? list[0] : null; }

  function resolveRelPath(basePath, target) {
    // basePath e.g. "ppt/slides/slide1.xml", target e.g. "../media/image1.png"
    const baseDir = basePath.split('/').slice(0, -1); // ["ppt","slides"]
    const parts = target.split('/');
    parts.forEach((p) => {
      if (p === '..') baseDir.pop();
      else if (p !== '.') baseDir.push(p);
    });
    return baseDir.join('/');
  }

  async function parsePptx(arrayBuffer) {
    const z = await window.JSZip.loadAsync(arrayBuffer);

    const presXmlText = await z.file('ppt/presentation.xml').async('string');
    const presDoc = xml(presXmlText);
    const sldSz = first(presDoc, 'p:sldSz');
    const slideWidthEmu = sldSz ? parseInt(sldSz.getAttribute('cx'), 10) : 9144000;
    const slideHeightEmu = sldSz ? parseInt(sldSz.getAttribute('cy'), 10) : 6858000;

    const relsXmlText = await z.file('ppt/_rels/presentation.xml.rels').async('string');
    const relsDoc = xml(relsXmlText);
    const relMap = {};
    Array.from(relsDoc.getElementsByTagName('Relationship')).forEach((r) => {
      relMap[r.getAttribute('Id')] = r.getAttribute('Target');
    });

    const sldIds = Array.from(presDoc.getElementsByTagName('p:sldId'));
    let slidePaths = sldIds
      .map((s) => {
        const rId = s.getAttribute('r:id');
        const target = relMap[rId];
        if (!target) return null;
        return 'ppt/' + target.replace(/^\.?\/?/, '');
      })
      .filter(Boolean);

    if (slidePaths.length === 0) {
      // Fallback: any slideN.xml files, numeric order
      slidePaths = Object.keys(z.files)
        .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
        .sort((a, b) => {
          const na = parseInt(a.match(/(\d+)/)[1], 10);
          const nb = parseInt(b.match(/(\d+)/)[1], 10);
          return na - nb;
        });
    }

    const slides = [];
    for (const slidePath of slidePaths) {
      const slideFile = z.file(slidePath);
      if (!slideFile) continue;
      const slideXmlText = await slideFile.async('string');
      const slideDoc = xml(slideXmlText);

      const slideName = slidePath.split('/').pop();
      const slideRelsPath = `ppt/slides/_rels/${slideName}.rels`;
      const slideRelsFile = z.file(slideRelsPath);
      let slideRelMap = {};
      if (slideRelsFile) {
        const slideRelsXmlText = await slideRelsFile.async('string');
        const slideRelsDoc = xml(slideRelsXmlText);
        Array.from(slideRelsDoc.getElementsByTagName('Relationship')).forEach((r) => {
          slideRelMap[r.getAttribute('Id')] = r.getAttribute('Target');
        });
      }

      const shapes = [];

      Array.from(slideDoc.getElementsByTagName('p:sp')).forEach((sp) => {
        try {
          const off = first(sp, 'a:off');
          const ext = first(sp, 'a:ext');
          const x = off ? parseInt(off.getAttribute('x'), 10) : 457200;
          const y = off ? parseInt(off.getAttribute('y'), 10) : 457200;
          const w = ext ? parseInt(ext.getAttribute('cx'), 10) : slideWidthEmu - x * 2;
          const h = ext ? parseInt(ext.getAttribute('cy'), 10) : 900000;
          const lines = Array.from(sp.getElementsByTagName('a:p'))
            .map((p) => Array.from(p.getElementsByTagName('a:t')).map((t) => t.textContent).join(''))
            .filter((t) => t.length > 0);
          if (lines.length) shapes.push({ type: 'text', x, y, w, h, lines });
        } catch (err) { /* skip malformed shape */ }
      });

      Array.from(slideDoc.getElementsByTagName('p:pic')).forEach((pic) => {
        try {
          const off = first(pic, 'a:off');
          const ext = first(pic, 'a:ext');
          const x = off ? parseInt(off.getAttribute('x'), 10) : 0;
          const y = off ? parseInt(off.getAttribute('y'), 10) : 0;
          const w = ext ? parseInt(ext.getAttribute('cx'), 10) : slideWidthEmu;
          const h = ext ? parseInt(ext.getAttribute('cy'), 10) : slideHeightEmu;
          const blip = first(pic, 'a:blip');
          const rId = blip ? blip.getAttribute('r:embed') : null;
          const target = rId ? slideRelMap[rId] : null;
          if (target) {
            const mediaPath = resolveRelPath(slidePath, target);
            shapes.push({ type: 'image', x, y, w, h, mediaPath });
          }
        } catch (err) { /* skip malformed picture */ }
      });

      slides.push({ shapes });
    }

    return { zip: z, slideWidthEmu, slideHeightEmu, slides };
  }

  async function buildPresentationPdf(parsed) {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const pageWidth = parsed.slideWidthEmu / EMU_PER_POINT;
    const pageHeight = parsed.slideHeightEmu / EMU_PER_POINT;

    let allText = '';
    parsed.slides.forEach((s) => s.shapes.forEach((sh) => { if (sh.type === 'text') allText += sh.lines.join(' '); }));
    let font, boldFont;
    if (BENGALI_RANGE.test(allText)) {
      const bytes = await fetch(HIND_SILIGURI_URL).then((r) => r.arrayBuffer());
      font = await pdfDoc.embedFont(bytes, { subset: true });
      boldFont = font;
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    const imageCache = {};
    async function embedMedia(mediaPath) {
      if (imageCache[mediaPath]) return imageCache[mediaPath];
      const file = parsed.zip.file(mediaPath);
      if (!file) return null;
      const bytes = await file.async('uint8array');
      let embedded = null;
      try {
        if (/\.png$/i.test(mediaPath)) embedded = await pdfDoc.embedPng(bytes);
        else embedded = await pdfDoc.embedJpg(bytes);
      } catch (err) {
        embedded = null;
      }
      imageCache[mediaPath] = embedded;
      return embedded;
    }

    let skippedShapes = 0;

    for (const slide of parsed.slides) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      for (const shape of slide.shapes) {
        try {
          const x = shape.x / EMU_PER_POINT;
          const boxW = shape.w / EMU_PER_POINT;
          const boxH = shape.h / EMU_PER_POINT;
          const topY = pageHeight - shape.y / EMU_PER_POINT;

          if (shape.type === 'image') {
            const embedded = await embedMedia(shape.mediaPath);
            if (embedded) {
              page.drawImage(embedded, { x, y: topY - boxH, width: boxW, height: boxH });
            }
          } else if (shape.type === 'text') {
            const isTitle = boxH > 0 && shape.y < parsed.slideHeightEmu * 0.22;
            const fontSize = isTitle ? 20 : 13;
            const useFont = isTitle ? boldFont : font;
            const lineHeight = fontSize * 1.3;
            const maxWidth = Math.max(40, boxW);
            let y = topY - fontSize;

            shape.lines.forEach((line) => {
              const words = line.split(' ');
              let current = '';
              const wrapped = [];
              words.forEach((word) => {
                const candidate = current ? `${current} ${word}` : word;
                if (useFont.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
                  wrapped.push(current);
                  current = word;
                } else {
                  current = candidate;
                }
              });
              wrapped.push(current);
              wrapped.forEach((wline) => {
                if (y < 20) return;
                page.drawText(wline, { x, y, size: fontSize, font: useFont, color: rgb(0.1, 0.1, 0.1) });
                y -= lineHeight;
              });
            });
          }
        } catch (err) {
          console.error('Skipped a shape that failed to render', err);
          skippedShapes += 1;
        }
      }
    }

    const bytes = await pdfDoc.save();
    return { bytes, skippedShapes };
  }

  async function loadFile(file) {
    setStatus('reading file…');
    sourceFileName = file.name;

    const arrayBuffer = await file.arrayBuffer();
    try {
      const parsed = await parsePptx(arrayBuffer);
      zip = parsed;
      slideCount = parsed.slides.length;
    } catch (err) {
      console.error(err);
      setStatus("couldn't read this file — is it a valid PowerPoint (.pptx)?");
      return;
    }

    docNameEl.textContent = `${file.name} · ${slideCount} slide${slideCount > 1 ? 's' : ''}`;
    toolbar.classList.add('active');
    actionsBar.classList.add('active');
    downloadBtn.disabled = false;
    window.VeloraQuickActions.render(quickActions, 'pptx2pdf.html', async () => {
      const { bytes } = await buildPresentationPdf(zip);
      return bytes;
    }, () => `${baseName(sourceFileName)}.pdf`);

    setStatus('ready to convert');
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); })
  );
  dropzone.addEventListener('drop', (e) => {
    const file = Array.from(e.dataTransfer.files || []).find((f) => /\.pptx$/i.test(f.name));
    if (file) loadFile(file);
  });

  changeFileBtn.addEventListener('click', () => {
    window.VeloraQuickActions.hide(quickActions);
    zip = null;
    slideCount = 0;
    toolbar.classList.remove('active');
    actionsBar.classList.remove('active');
    setStatus('');
  });

  downloadBtn.addEventListener('click', async () => {
    if (!zip) return;
    downloadBtn.disabled = true;
    setStatus('building PDF…');
    try {
      const { bytes, skippedShapes } = await buildPresentationPdf(zip);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName(sourceFileName)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(skippedShapes ? `done — downloaded (${skippedShapes} element(s) skipped)` : 'done — PDF downloaded');
    } catch (err) {
      console.error(err);
      setStatus('conversion failed — check the console');
    } finally {
      downloadBtn.disabled = false;
    }
  });
})();
