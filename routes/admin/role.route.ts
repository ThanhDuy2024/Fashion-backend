import { Router } from "express";
import * as roleController from "../../controllers/admin/role.controller";
const route = Router();

route.post('/create', roleController.roleCreate);

export default route;