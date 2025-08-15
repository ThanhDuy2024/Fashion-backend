import "dotenv/config";
import express from "express";
import adminRoute from "./routes/admin/index.route";
import * as database from "./configs/database";
const app = express();
const port = process.env.PORT;

database.connect();

app.use("/api/admin", adminRoute)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
