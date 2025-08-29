import { Router } from "express";
import * as roleController from "../../controllers/admin/role.controller";
import * as validate from "../../validates/role.validate"
const route = Router();

route.post('/create', validate.roleValidate, roleController.roleCreate);

route.get('/list', roleController.roleList);

route.get('/detail/:id', roleController.roleDetail);

route.patch('/edit/:id', roleController.roleEdit);

route.delete('/delete/:id', roleController.roleDelete);

route.get('/trash/list', roleController.roleTrashList);

route.patch('/trash/restore/:id', roleController.roleaTrashRestore)
export default route;