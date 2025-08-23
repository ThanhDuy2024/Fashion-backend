import { Router } from "express";
import * as middleware from "../../middlewares/accountAdmin.verify.middleware";
import accountAdminRoute from "./accountAdmin.route";
import categoryRoute from "./category.route";
import roleRoute from "./role.route";
const route = Router();

route.use('/account', accountAdminRoute);

route.use('/category', middleware.verifyAccount, categoryRoute);

route.use('/role', middleware.verifyAccount, roleRoute);

export default route;