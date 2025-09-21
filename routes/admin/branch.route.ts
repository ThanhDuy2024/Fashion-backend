import { Router } from "express";
import * as branchController from "../../controllers/admin/branch.controller";
import { storage } from "../../helpers/cloudinary.helper";
import multer from "multer";
const route = Router();

const upload = multer({
  storage: storage
});

route.post("/create", upload.single("image"), branchController.createBranch);

route.get('/list', branchController.getAllBranch);

route.get('/detail/:id', branchController.branchDetail);
export default route;