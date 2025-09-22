import { Router } from "express";
import * as branchController from "../../controllers/admin/branch.controller";
import { storage } from "../../helpers/cloudinary.helper";
import multer from "multer";
import { branchValidate } from "../../validates/branch.validate";
const route = Router();

const upload = multer({
  storage: storage
});

route.post("/create", upload.single("image"), branchValidate, branchController.createBranch);

route.get('/list', branchController.getAllBranch);

route.get('/detail/:id', branchController.branchDetail);

route.patch('/edit/:id', upload.single("image"), branchValidate, branchController.updateBranch);

route.delete('/delete/:id', branchController.deleteBranch);
export default route;