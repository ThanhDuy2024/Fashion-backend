import { Router } from "express";
import * as userController from "../../controllers/admin/accountClient.controller";
const route = Router();

route.get('/list', userController.getAllAccountClient);

route.patch('/edit/:id', userController.updateAccountClient);

route.delete('/delete/:id', userController.deleteAccountClient);

route.get('/trash/list', userController.getAllTrashAccountClient);
export default route;