import { Router } from "express";
import * as styleController from "../../controllers/admin/style.controller";
import * as styleValidate from "../../validates/style.validate";
const route = Router();

route.post('/create', styleValidate.styleValidate, styleController.styleCreate);

export default route;