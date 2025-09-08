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

route.post("/create", middleware.verifyAccount, upload.single('image'), validate.accountAdminCreate, accountAdminController.create);

route.get("/list", middleware.verifyAccount, accountAdminController.list);

route.get("/detail/:id", middleware.verifyAccount, accountAdminController.deltail);

route.patch("/edit/:id", middleware.verifyAccount, upload.single('image'), validate.profileValidate, accountAdminController.edit);

route.delete("/delete/:id", middleware.verifyAccount, accountAdminController.deleted);

route.get("/trash/list", middleware.verifyAccount, accountAdminController.trashList);

route.patch("/trash/restore/:id", middleware.verifyAccount, accountAdminController.trashRestore);
export default route;