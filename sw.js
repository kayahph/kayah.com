/* =====================================================
   KAYAH SERVICE WORKER
===================================================== */

const CACHE_NAME = "kayah-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./kayah-logo.png"
];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", function(event){

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache){
                return cache.addAll(APP_FILES);
            })
    );

    self.skipWaiting();
});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", function(event){

    event.waitUntil(

        caches.keys()
            .then(function(cacheNames){

                return Promise.all(

                    cacheNames.map(function(cacheName){

                        if(cacheName !== CACHE_NAME){

                            return caches.delete(cacheName);

                        }

                    })

                );

            })

    );

    self.clients.claim();
});


/* =====================================================
   FETCH
===================================================== */

self.addEventListener("fetch", function(event){

    /*
       IMPORTANT:
       Always use the network for HTML pages.

       This prevents GitHub from showing an old
       cached version of Dashboard, Products, etc.
    */

    if(event.request.method !== "GET"){
        return;
    }

    const requestURL = new URL(event.request.url);

    if(
        event.request.mode === "navigate" ||
        requestURL.pathname.endsWith(".html") ||
        requestURL.pathname.endsWith("/")
    ){

        event.respondWith(

            fetch(event.request)
                .catch(function(){

                    return caches.match(event.request);

                })

        );

        return;
    }


    /*
       Other assets:
       Network first, then cache if offline.
    */

    event.respondWith(

        fetch(event.request)
            .then(function(response){

                if(
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ){

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache){

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }

                return response;

            })
            .catch(function(){

                return caches.match(event.request);

            })

    );

});
