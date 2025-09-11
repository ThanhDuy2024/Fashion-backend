import { Router } from "express";
import * as accountController from "../../controllers/clients/accountClient.controller";
const route = Router();

route.post('/register', accountController.register);

route.post('/confirm/email', accountController.confirmEmail);

route.post('/login', accountController.login);

route.post('/logout', accountController.logout);
export default route;