if ('serviceWorker' in navigator) {
  window.addEventListener('load', registerServiceWorker);

  function registerServiceWorker() {
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      window.removeEventListener('load', registerServiceWorker);
    }).catch(function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }
}
