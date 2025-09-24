import { Router } from "express";
import * as middleware from "../../middlewares/accountClient.verify.middleware";
import * as orderController from "../../controllers/clients/order.controller";
const route = Router();

route.post("/create", middleware.verify, orderController.createOrder);

route.get("/list", middleware.verify, orderController.getAllOrder);

route.get("/detail/:id", middleware.verify, orderController.orderDetail)

route.delete("/delete/:id", middleware.verify, orderController.deleteOrder)

route.get("/zaloPay", middleware.verify, orderController.orderZaloPay);
export default route;