jest.mock("axios", () => ({
  get: jest.fn()
}));

describe("Item Service", () => {
  beforeEach(() => {
    jest.resetModules();       // 🔥 reset module cache
    jest.clearAllMocks();
  });

  // -------------------------
  // GET /items
  // -------------------------

  it("should fetch items (cache miss on first call)", async () => {
    const mockedAxios = require("axios");   // ✅ get fresh instance
    mockedAxios.get.mockResolvedValue({
      data: {
        results: [{}, {}],
        next: null
      }
    });

    const { getItems } = require("../services/itemService");

    const res = await getItems();

    expect(res.hit).toBe(false);
    expect(res.data).toEqual([1, 2]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("should return cached data on second call (cache hit)", async () => {
    const mockedAxios = require("axios"); 
    mockedAxios.get.mockResolvedValue({
      data: {
        results: [{}, {}],
        next: null
      }
    });

    const { getItems } = require("../services/itemService");

    const first = await getItems();
    const second = await getItems();

    expect(first.hit).toBe(false);
    expect(second.hit).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("should handle pagination correctly", async () => {
    const mockedAxios = require("axios"); 
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          results: [{}, {}],
          next: "next-url"
        }
      })
      .mockResolvedValueOnce({
        data: {
          results: [{}, {}],
          next: null
        }
      });

    const { getItems } = require("../services/itemService");

    const res = await getItems();

    expect(res.data).toEqual([1, 2, 3, 4]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it("should handle external API failure", async () => {
    const mockedAxios = require("axios"); 
    mockedAxios.get.mockRejectedValue(new Error("API failed"));

    const { getItems } = require("../services/itemService");

    await expect(getItems()).rejects.toThrow("API failed");
  });

  // -------------------------
  // GET /items/:id
  // -------------------------

  it("should fetch item by id successfully", async () => {
    const mockedAxios = require("axios"); 
    mockedAxios.get.mockResolvedValue({
      data: {
        id: 1,
        name: "bulbasaur",
        species: { name: "seed" }
      }
    });

    const { getItemById } = require("../services/itemService");

    const res = await getItemById(1);

    expect(res).toEqual({
      id: 1,
      name: "bulbasaur",
      description: "seed"
    });
  });

  it("should return 404 for non-existing item", async () => {
    const mockedAxios = require("axios"); 
    mockedAxios.get.mockRejectedValue({
      response: { status: 404 }
    });

    const { getItemById } = require("../services/itemService");

    await expect(getItemById(999)).rejects.toMatchObject({
      response: { status: 404 }
    });
  });

  it("should handle external API error for item detail", async () => {
    const mockedAxios = require("axios"); 
    mockedAxios.get.mockRejectedValue(new Error("API down"));

    const { getItemById } = require("../services/itemService");

    await expect(getItemById(1)).rejects.toThrow("API down");
  });
});