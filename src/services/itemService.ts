import { createCache } from "../cache/cache";
import { fetchAllPokemon, fetchPokemonById } from "../clients/pokeClient";

const cache = createCache<number[]>(); // cache = { get: async function(...) { ... } }

export const getItems = async (forceRefresh = false, staleWhileRevalidate = false) => {
    if (forceRefresh) {
        const data = await fetchAllPokemon();
        //console.dir(data, { depth: null, maxArrayLength: null })
        let return_data = [];
        for (let i = 0; i < data.length; i++) { // go through entire pokemon list
          const parts = data[i].url.split('/')
          const id = Number(parts[parts.length - 2])
          return_data.push(Number(id))
        }
        return {
            data: return_data,
            hit: false
        };
    }

    if(staleWhileRevalidate){
        return cache.getSWR(async () => {
          const data = await fetchAllPokemon();
          let return_data = [];
          for (let i = 0; i < data.length; i++) { // go through entire pokemon list
            const parts = data[i].url.split('/')
            const id = Number(parts[parts.length - 2])
            return_data.push(Number(id))
          }
          return return_data;
        });
    }

    return cache.getTTL(async () => {
      const data = await fetchAllPokemon();
      let return_data = [];
      for (let i = 0; i < data.length; i++) { // go through entire pokemon list
        const parts = data[i].url.split('/')
        const id = Number(parts[parts.length - 2])
        return_data.push(Number(id))
      }
      return return_data;
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