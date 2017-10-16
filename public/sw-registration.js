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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
    }
    window.addEventListener('load', registerServiceWorker);
  });
}
