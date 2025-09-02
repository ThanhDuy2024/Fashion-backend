import { Router } from "express";
import * as couponController from "../../controllers/admin/coupon.controller";
const route = Router();

route.post('/create', couponController.create);

export default route;