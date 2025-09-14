import { Router } from "express";
import * as middleware from "../../middlewares/accountClient.verify.middleware";
import * as orderController from "../../controllers/clients/order.controller";
const route = Router();

route.post("/create", middleware.verify, orderController.createOrder);

export default route;