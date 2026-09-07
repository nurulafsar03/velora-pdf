/* ============================================================
   VeloraPDF quick actions
   Renders a row of "send this file to <tool>" buttons, shared
   across every tool page so a loaded file can jump to any other
   tool without re-uploading.
   ============================================================ */

window.VeloraQuickActions = (() => {
  const ALL_TOOLS = [
    { url: 'view.html', labelKey: 'view_title', fallback: 'View & Print PDF' },
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

  function render(containerEl, selfUrl, getArrayBuffer, getFileName) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'qa-label';
    label.textContent = (window.veloraT && window.veloraT('view_quick_actions_label')) || 'Or send this file to another tool';
    containerEl.appendChild(label);

    ALL_TOOLS.filter((tool) => tool.url !== selfUrl).forEach((tool) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qa-btn';
      btn.textContent = (window.veloraT && window.veloraT(tool.labelKey)) || tool.fallback;
      btn.addEventListener('click', () => {
        const arrayBuffer = getArrayBuffer();
        if (!arrayBuffer) return;
        window.VeloraHandoff.navigateWithFile(arrayBuffer, getFileName() || 'document.pdf', tool.url);
      });
      containerEl.appendChild(btn);
    });

    containerEl.classList.add('active');
  }

  function hide(containerEl) {
    if (!containerEl) return;
    containerEl.classList.remove('active');
    containerEl.innerHTML = '';
  }

  return { render, hide, ALL_TOOLS };
})();
