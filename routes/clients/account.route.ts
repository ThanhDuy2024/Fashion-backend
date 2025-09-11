import { Router } from "express";
import * as accountController from "../../controllers/clients/accountClient.controller";
import * as validate from "../../validates/auth.validate";
import * as middleware from "../../middlewares/accountClient.verify.middleware";
import { storage } from "../../helpers/cloudinary.helper";
import multer from "multer";
const route = Router();

const upload = multer({
  storage: storage
})

route.post('/register', validate.registerValidate, accountController.register);

route.post('/confirm/email', accountController.confirmEmail);

route.post('/login', validate.loginValidate, accountController.login);

route.post('/logout', accountController.logout);

route.get('/profile', middleware.verify, accountController.profile);

route.patch('/profile/edit', middleware.verify, upload.single("image"), accountController.updateProfile);
export default route;