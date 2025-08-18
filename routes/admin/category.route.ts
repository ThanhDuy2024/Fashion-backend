import { Router } from "express";
import { storage } from "../../helpers/cloudinary.helper";
import * as categoriesController from "../../controllers/admin/categories.controller";
import multer from "multer";
const route = Router();

const upload = multer({
  storage: storage
})

route.post('/create', upload.single("image"), categoriesController.categoryCreate);

export default route;