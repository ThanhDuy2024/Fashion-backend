import { Router } from "express";
import * as couponController from "../../controllers/admin/coupon.controller";
import { couponValidate } from "../../validates/coupon.validate";
const route = Router();

route.post('/create', couponValidate, couponController.create);

export default route;