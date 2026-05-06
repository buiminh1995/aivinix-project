import express from "express";
import itemsRouter from "./routes/items";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const app = express();

app.use(express.json());

const swaggerDoc = YAML.load("./swagger.yaml");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use("/items", itemsRouter);

export default app;