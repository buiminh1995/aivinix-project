import axios from "axios";

export const fetchAllPokemon = async () => {
  let results: any[] = [];
  let url = "https://pokeapi.co/api/v2/pokemon";

  while (url) {
    const res = await axios.get(url);
    results.push(...res.data.results);
    url = res.data.next;
  }

  return results;
};

export const fetchPokemonById = async (id: number) => {
  const res = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${id}`
  );
  return res.data;
};