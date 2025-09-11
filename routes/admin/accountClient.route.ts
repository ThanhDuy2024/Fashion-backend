import { Router } from "express";
import * as userController from "../../controllers/admin/accountClient.controller";
const route = Router();

route.get('/list', userController.getAllAccountClient);

export default route;