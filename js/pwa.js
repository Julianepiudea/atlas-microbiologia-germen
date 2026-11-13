/* Registro del service worker (instalación como app y uso sin conexión) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW no registrado:', err));
  });
}
