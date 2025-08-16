import { Router } from "express";
import * as accountAdminController from "../../controllers/admin/accountAdmin.controller";
import * as validate from "../../validates/auth.validate";
import * as middleware from "../../middlewares/accountAdmin.verify.middleware";
const route = Router();

route.post("/register", validate.registerValidate, accountAdminController.register);

route.post("/login", validate.loginValidate, accountAdminController.login);

route.get("/profile", middleware.verifyAccount, accountAdminController.profile);

route.post("/refresh", accountAdminController.refresh);
export default route;