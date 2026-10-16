(() => {
  const dialog = document.querySelector('#account-dialog');
  const trigger = document.querySelector('#account-trigger');
  trigger.setAttribute('aria-expanded', 'false');
  function position() {
    if (!dialog.open) return;
    const bounds = trigger.getBoundingClientRect();
    const top = Math.max(12, bounds.bottom + 8);
    dialog.style.top = `${top}px`;
    dialog.style.left = `${Math.max(12, Math.min(bounds.right - dialog.offsetWidth, innerWidth - dialog.offsetWidth - 12))}px`;
    dialog.style.maxHeight = `${Math.max(120, innerHeight - top - 12)}px`;
  }
  trigger.addEventListener('click', () => {
    if (dialog.open) { dialog.close(); return; }
    document.querySelector('header').classList.remove('open');
    document.querySelector('#menu').setAttribute('aria-expanded', 'false');
    dialog.show();
    trigger.setAttribute('aria-expanded', 'true');
    position();
  });
  document.querySelector('#account-close').addEventListener('click', () => dialog.close());
  document.querySelector('#account-learning').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  document.addEventListener('click', event => {
    if (dialog.open && !dialog.contains(event.target) && !trigger.contains(event.target)) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault(); dialog.close(); trigger.focus({ preventScroll: true });
    }
  });
  document.addEventListener('focusin', event => {
    if (dialog.open && !dialog.contains(event.target) && !trigger.contains(event.target)) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.setAttribute('aria-expanded', 'false'));
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, { passive: true });
})();
