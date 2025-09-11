import { Router } from "express";
import * as accountController from "../../controllers/clients/accountClient.controller";
const route = Router();

route.post('/register', accountController.register);

route.post('/confirm/email', accountController.confirmEmail);

route.post('/login', accountController.login);
export default route;