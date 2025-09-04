import { Router } from "express";
import * as productController from "../../controllers/admin/product.controller";
import { storage } from "../../helpers/cloudinary.helper";
import multer from "multer";
const route = Router();

const upload = multer({
  storage: storage
})

route.post('/create', upload.single("image"), productController.create);

export default route;