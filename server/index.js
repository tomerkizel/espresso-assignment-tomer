import express from "express";
import dbConnection from "./db/service/dbConnection.js";
import { initializeDatabase } from "./db/index.js";
import issuesRouter from "./routers/issues.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173'] }))
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

const initRouters = () => {
    const issuesRouterInstance = new issuesRouter();
    issuesRouterInstance.userRouter(app);
}

app.listen(3000, async () => {
  console.log("Server is running on port 3000");
  await dbConnection.init();
  await initializeDatabase();
  initRouters();
});