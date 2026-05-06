type Cache<T> = {
  data: T | null;
  expiry: number;
  isRefreshing: boolean;
  promise?: Promise<T>;
};

const TTL = 60 * 1000;

export const createCache = <T>() => { //factory function, remember cache by closure
    let cache: Cache<T> = {
        data: null,
        expiry: 0,
        isRefreshing: false
    };

    const startRefresh = (fetcher: () => Promise<T>) => {
        cache.isRefreshing = true;
        cache.promise = fetcher() // save promise to cache.promise so other requests know there is already a promise
        .then((data) => {
            cache.data = data; //save to cache first
            cache.expiry = Date.now() + TTL;
            return data; //then return data to all waiting requests
        })
        .finally(() => {
            cache.isRefreshing = false;
        });
    }

    return {     
                                                   // return {
        async getTTL(fetcher: () => Promise<T>) {  //     getTTL: async function (fetcher) { }
        const now = Date.now();                    // }

            // HIT
            if (cache.data && cache.expiry > now) {
                return { data: cache.data, hit: true };
            }

            // Prevent stampede
            if (cache.isRefreshing && cache.promise) {
                const data = await cache.promise;
                return { data, hit: false };
            }

            // if no cache or cached expired and not refreshing -> start refresh
            startRefresh(fetcher);

            const data = await cache.promise; 

            return { data, hit: false }; //return promise to current request
        },

        async getSWR(fetcher: () => Promise<T>) { 
            const now = Date.now();               

            if (cache.data && (cache.expiry > now || cache.expiry === now)) { //fresh
                console.log('fresh cache')
                return { data: cache.data, hit: true };
            }
            if (cache.data && cache.expiry < now) { //stale
                console.log('stale cache')
                if (cache.isRefreshing && cache.promise) { // if during refresh, still give client stale cache
                    return { data: cache.data, hit: false };
                }
                startRefresh(fetcher); // if no refresh, start refresh
                return { data: cache.data, hit: true }; // while returning stale cache
            }
            else{ //no cache at all
                console.log('no cache at all')
                startRefresh(fetcher); 
                const data = await cache.promise; // no data in cache yet, all requests wait for catch.promise
                return { data, hit: false }; // return promise to all awaiting requests
            }
        }
    };
};