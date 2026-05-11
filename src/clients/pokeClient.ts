import axios from "axios";

export const fetchAllPokemon = async () => {
  let results: any[] = [];
  let url = "https://pokeapi.co/api/v2/pokemon";
  const limit = 20;
  let offset = 1;
  while (url) {
    const page = (offset - 1) * limit;
    url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${page}`;
    const res = await axios.get(url);
    results.push(...res.data.results);
    url = res.data.next;
    console.log(url);
    offset++;
  }

  return results;
};

export const fetchPokemonById = async (id: number) => {
  const res = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${id}`
  );
  return res.data;
};