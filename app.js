import express from "express";
import bodyParser from "body-parser";
import process from "process";
import routes from "./routes/index.js";
import cache from 'memory-cache';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

// Start server
const server = app.listen(PORT, () =>
  console.log(`🚀 Webhook server listening on port http://localhost:${PORT}`),
);

export default app;
