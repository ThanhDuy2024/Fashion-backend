import express from "express";
import adminRoute from "./routes/admin/index.route";
import "dotenv/config";
const app = express();
const port = process.env.PORT;

app.use("/api/admin", adminRoute)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
