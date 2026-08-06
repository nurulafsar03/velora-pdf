(() => {
  'use strict';

  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach((dd) => {
      const btn = dd.querySelector('.nav-dropdown-btn');
      if (!btn) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dd.classList.contains('open');
        dropdowns.forEach((other) => {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.nav-dropdown-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          dd.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', () => {
      dropdowns.forEach((dd) => {
        dd.classList.remove('open');
        const btn = dd.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdowns.forEach((dd) => dd.classList.remove('open'));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initDropdowns);
})();
