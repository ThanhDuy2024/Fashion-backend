import { Router } from "express";
import * as orderController from "../../controllers/admin/order.controller";
const route = Router();

route.get('/list', orderController.getAllOrder);

route.get('/detail/:id', orderController.orderDetail);
export default route;