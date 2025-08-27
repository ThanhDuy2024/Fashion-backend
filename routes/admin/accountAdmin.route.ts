import { Router } from "express";
import * as accountAdminController from "../../controllers/admin/accountAdmin.controller";
import * as validate from "../../validates/auth.validate";
import * as middleware from "../../middlewares/accountAdmin.verify.middleware";
import { storage } from "../../helpers/cloudinary.helper";
import multer from "multer";
const route = Router();

const upload = multer({
  storage: storage
})

route.post("/register", validate.registerValidate, accountAdminController.register);

route.post("/login", validate.loginValidate, accountAdminController.login);

route.get("/profile", middleware.verifyAccount, accountAdminController.profile);

route.patch('/profile/edit', middleware.verifyAccount, upload.single("image"), validate.profileValidate,accountAdminController.profileEdit);

route.post("/refresh", accountAdminController.refresh);
export default route;