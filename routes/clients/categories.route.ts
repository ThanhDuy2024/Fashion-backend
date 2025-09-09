import { Router } from "express";
import * as categoriesController from "../../controllers/clients/categories.controller";
const route = Router();

route.get('/list', categoriesController.categoriesTree);

export default route;