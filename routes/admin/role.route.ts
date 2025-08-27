import { Router } from "express";
import * as roleController from "../../controllers/admin/role.controller";
import * as validate from "../../validates/role.validate"
const route = Router();

route.post('/create', validate.roleValidate, roleController.roleCreate);

export default route;