(() => {
  const dialog = document.querySelector('#account-dialog');
  const trigger = document.querySelector('#account-trigger');
  trigger.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    document.querySelector('header').classList.remove('open');
    document.querySelector('#menu').setAttribute('aria-expanded', 'false');
  });
  document.querySelector('#account-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
})();
