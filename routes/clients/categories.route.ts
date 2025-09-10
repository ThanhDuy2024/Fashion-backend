import { Router } from "express";
import * as categoriesController from "../../controllers/clients/categories.controller";
const route = Router();

route.get('/list', categoriesController.categoriesTree);

route.get('/:id/product', categoriesController.getProductInCategory);
export default route;