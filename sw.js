/* =====================================================
   KAYAH SERVICE WORKER
===================================================== */

const CACHE_NAME = "kayah-v1";


const APP_FILES = [

    "./",

    "./index.html",

    "./manifest.json",

    "./kayah-logo.png"

];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener(
    "install",
    function(event){

        event.waitUntil(

            caches.open(CACHE_NAME)
                .then(function(cache){

                    return cache.addAll(APP_FILES);

                })

        );

        self.skipWaiting();

    }
);


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener(
    "activate",
    function(event){

        event.waitUntil(

            caches.keys()
                .then(function(cacheNames){

                    return Promise.all(

                        cacheNames.map(
                            function(cacheName){

                                if(
                                    cacheName !== CACHE_NAME
                                ){

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })

        );

        self.clients.claim();

    }
);


/* =====================================================
   FETCH
===================================================== */

self.addEventListener(
    "fetch",
    function(event){

        /*
         * Use network first.
         * If the network is unavailable,
         * use the cached version.
         */

        event.respondWith(

            fetch(event.request)
                .then(function(response){

                    /*
                     * Save a fresh copy.
                     */

                    if(
                        response &&
                        response.status === 200 &&
                        response.type === "basic"
                    ){

                        const responseClone =
                            response.clone();

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

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);
