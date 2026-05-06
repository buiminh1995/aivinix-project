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

  return {                                  // return {
    async getTTL(fetcher: () => Promise<T>) {  //     getTTL: async function (fetcher) { }
      const now = Date.now();               // }

      // HIT
      if (cache.data && cache.expiry > now) {
        return { data: cache.data, hit: true };
      }

      // Prevent stampede
      if (cache.isRefreshing && cache.promise) {
        const data = await cache.promise;
        return { data, hit: false };
      }

      // if there is no cache and cache is not refreshing => time to get data from external API 

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

      const data = await cache.promise; //return data for current request

      return { data, hit: false };
    },

    async getSWR(fetcher: () => Promise<T>) { 
      const now = Date.now();               

      if (cache.data) {
        if(cache.expiry < now){
            if (cache.isRefreshing && cache.promise) {
                return { data: cache.data, hit: true };
            }
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
        return { data: cache.data, hit: true };
      } else {
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
            const data = await cache.promise; //return promise for current request
            return { data, hit: false };
      }
    }
  };
};