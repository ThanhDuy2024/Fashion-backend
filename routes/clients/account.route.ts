import { Router } from "express";
import * as accountController from "../../controllers/clients/accountClient.controller";
import * as validate from "../../validates/auth.validate";
import * as middleware from "../../middlewares/accountClient.verify.middleware";
const route = Router();

route.post('/register', validate.registerValidate, accountController.register);

route.post('/confirm/email', accountController.confirmEmail);

route.post('/login', validate.loginValidate, accountController.login);

route.post('/logout', accountController.logout);

route.get('/profile', middleware.verify, accountController.profile);
export default route;