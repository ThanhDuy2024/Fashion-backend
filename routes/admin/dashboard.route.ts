import { Router } from "express";
import * as dashboardController from "../../controllers/admin/dashboard.controller"
const route = Router();

route.get("/list", dashboardController.dashboard);

export default route;