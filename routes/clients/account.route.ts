import { Router } from "express";
import * as accountController from "../../controllers/clients/accountClient.controller";
const route = Router();

route.post('/register', accountController.register);

export default route;