import { Router } from "express";
import * as dashboardController from "../../controllers/admin/dashboard.controller"
const route = Router();

route.post("/order", dashboardController.dashboardOrder);

route.get("/total", dashboardController.totalPrice);
export default route;