import { Router } from "express";
import * as orderController from "../../controllers/admin/order.controller";
const route = Router();

route.get('/list', orderController.getAllOrder);

export default route;