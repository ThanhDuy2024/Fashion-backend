import { Router } from "express";
import * as couponController from "../../controllers/admin/coupon.controller";
import { couponValidate } from "../../validates/coupon.validate";
const route = Router();

route.post('/create', couponValidate, couponController.create);

route.get('/list', couponController.list);
export default route;