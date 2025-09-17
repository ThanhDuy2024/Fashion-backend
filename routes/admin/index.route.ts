import { Router } from "express";
import * as middleware from "../../middlewares/accountAdmin.verify.middleware";
import accountAdminRoute from "./accountAdmin.route";
import categoryRoute from "./category.route";
import roleRoute from "./role.route";
import styleRoute from "./style.route";
import couponRoute from "./coupon.route";
import productRoute from "./product.route";
import userRoute from "./accountClient.route";
import orderRoute from "./order.route";
const route = Router();

route.use('/account', accountAdminRoute);

route.use('/category', middleware.verifyAccount, categoryRoute);

route.use('/role', middleware.verifyAccount, roleRoute);

route.use('/style', middleware.verifyAccount, styleRoute);

route.use('/coupon', middleware.verifyAccount, couponRoute);

route.use('/product', middleware.verifyAccount, productRoute);

route.use('/account/user', middleware.verifyAccount, userRoute);

route.use('/order', middleware.verifyAccount, orderRoute);
export default route;