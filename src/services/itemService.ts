import { createCache } from "../cache/cache";
import { fetchAllPokemon, fetchPokemonById } from "../clients/pokeClient";

const cache = createCache<number[]>(); // cache = { get: async function(...) { ... } }

export const getItems = async (forceRefresh = false, staleWhileRevalidate = false) => {
    if (forceRefresh) {
        const data = await fetchAllPokemon();
        console.log(data)
        return {
            data: data.map((_, i) => i + 1),
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