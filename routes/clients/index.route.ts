import { Router } from "express";
import categoriesRoute from "./categories.route";
import productRoute from "./product.route";
import accountRoute from "./account.route";
import orderRoute from "./order.route";
import branchRoute from "./branch.route";
const route = Router();

route.use("/category", categoriesRoute);

route.use("/product", productRoute);

route.use("/account", accountRoute);

route.use("/order", orderRoute);

route.use("/branch", branchRoute);
export default route;