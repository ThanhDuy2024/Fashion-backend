import { Router } from "express";
import * as accountAdminController from "../../controllers/admin/accountAdmin.controller";
import * as validate from "../../validates/auth.validate";
const route = Router();

route.post("/register", validate.registerValidate, accountAdminController.register);

route.post("/login", validate.loginValidate, accountAdminController.login);

route.get("/profile", accountAdminController.profile);
export default route;