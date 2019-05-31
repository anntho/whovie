self.addEventListener('install', function(event) {
    console.log('SW Installed');

    event.waitUntil(
        caches.open('static')
            .then(function(cache) {
                cache.addAll([
                    '/',
                    '/manifest.json',
                    '/icon/icon-96x96.png',
                    '/icon/icon-144x144.png',
                    '/icon/icon-256x256.png',
                    '/icon/icon-512x512.png',
                    '/index.ejs',
                    '/css/index.css',
                    '/css/loaders.css',
                    '/css/materialize.min.css',
                    '/js/index.js',
                    '/js/jquery.slim.min.js',
                    '/js/materialize.min.js',
                    '/js/sweetalert.min.js',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://fonts.googleapis.com/css?family=Roboto:300,400,700',
                    '/api/data/trivia/questions',
                    '/api/data/list/0'
                ]);
            })
    );
});

self.addEventListener('activate', function() {
    console.log('SW Activated');
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (res) {
                if (res) {
                    return res;
                } else {
                    return fetch(event.request);
                }
            })
    );
});