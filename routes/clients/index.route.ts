import { Router } from "express";
import categoriesRoute from "./categories.route";
import productRoute from "./product.route";
const route = Router();

route.use("/category", categoriesRoute);

route.use("/product", productRoute);

export default route;