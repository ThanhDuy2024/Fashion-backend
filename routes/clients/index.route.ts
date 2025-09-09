import { Router } from "express";
import categoriesRoute from "./categories.route";
const route = Router();

route.use("/category", categoriesRoute);

export default route;