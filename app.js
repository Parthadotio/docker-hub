import express from "express";
import containerRoutes from './routes/createContainer.routes.js';

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ status: "Management APIs are up and running!" });
});

app.use('/container', containerRoutes);

export default app;
