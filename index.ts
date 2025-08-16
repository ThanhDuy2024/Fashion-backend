import "dotenv/config";
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import adminRoute from "./routes/admin/index.route";
import * as database from "./configs/database";
const app = express();
const port = process.env.PORT;

database.connect();
app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: String(process.env.PORT_FE),
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, //cho phep gui cookie
}));

app.use("/api/admin", adminRoute)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
