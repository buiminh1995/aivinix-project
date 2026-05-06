import express from "express";
import { getItems, getItemById } from "../services/itemService";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const forceRefresh = req.query.forceRefresh === "true";

    const { data, hit } = await getItems(forceRefresh);

    res.setHeader("X-Cache", hit ? "HIT" : "MISS");

    res.json(data);
  } catch {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const data = await getItemById(id);
    res.json(data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(502).json({ error: "External API failed" });
  }
});

export default router;