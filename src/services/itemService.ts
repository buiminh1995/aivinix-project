import { createCache } from "../cache/cache";
import { fetchAllPokemon, fetchPokemonById } from "../clients/pokeClient";

const cache = createCache<number[]>(); // cache = { get: async function(...) { ... } }

export const getItems = async (forceRefresh = false, staleWhileRevalidate = false) => {
    if (forceRefresh) {
        const data = await fetchAllPokemon();
        console.dir(data, { depth: null, maxArrayLength: null })
        let return_data = [];
        for (let i = 0; i < data.length; i++) { // go through entire pokemon list
          let slash_count = 0
          let id = ''
          for (let j = -1; j >= -data[i].url.length; j--) { // go from the end of url of each pokemon
            const char = data[i].url.at(j)
            if (char === undefined) {
              break;
            }
            else {
              if (char === '/') {
                if (slash_count === 0){
                  slash_count++
                }
                else {
                  break // escape loop, we have the id
                }
              } else{
                  if (!Number.isNaN(Number(char))){
                    id = char + id
                  }
                }
            }
          }
          return_data.push(Number(id))
        }
        return {
            data: return_data,
            count: return_data.length,
            hit: false
        };
    }

    if(staleWhileRevalidate){
        return cache.getSWR(async () => {
        const data = await fetchAllPokemon();
        return data.map((_, i) => i + 1);
    });
    }

    return cache.getTTL(async () => {
    const data = await fetchAllPokemon();
    return data.map((_, i) => i + 1);
    });
};

export const getItemById = async (id: number) => {
  const data = await fetchPokemonById(id);
  console.log(data)

  return {
    id: data.id,
    name: data.name,
    description: data.species?.name
  };
};