import { Router } from "express";
import categoriesRoute from "./categories.route";
import productRoute from "./product.route";
import accountRoute from "./account.route";
const route = Router();

route.use("/category", categoriesRoute);

route.use("/product", productRoute);

route.use("/account", accountRoute);
export default route;