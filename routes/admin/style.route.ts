import { Router } from "express";
import * as styleController from "../../controllers/admin/style.controller";
import * as styleValidate from "../../validates/style.validate";
const route = Router();

route.post('/create', styleValidate.styleValidate, styleController.styleCreate);

route.get("/list", styleController.styleList);

route.get("/detail/:id", styleController.styleDetail);

route.patch("/edit/:id", styleValidate.styleEditValidate, styleController.styleEdit);

route.delete('/delete/:id', styleController.styleDelete);

route.get('/trash/list', styleController.styleTrashList);
export default route;