import { Router } from "express";
import * as accountAdminController from "../../controllers/admin/accountAdmin.controller";
const route = Router();

route.post("/register", accountAdminController.register);

export default route;