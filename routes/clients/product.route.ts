import { Router } from "express";
import * as productController from "../../controllers/clients/product.controller";
const route = Router();

route.get("/list", productController.getAllProduct);

route.get("/detail/:id", productController.getProductDeatail);

export default route;