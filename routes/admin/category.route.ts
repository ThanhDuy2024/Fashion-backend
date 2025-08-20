import { Router } from "express";
import { storage } from "../../helpers/cloudinary.helper";
import * as categoriesController from "../../controllers/admin/categories.controller";
import * as validate from "../../validates/categories.validate";
import multer from "multer";
const route = Router();

const upload = multer({
  storage: storage
})

route.post('/create', upload.single("image"), validate.categoriesValidate, categoriesController.categoryCreate);

route.get('/list', categoriesController.categoryList);

route.get('/detail/:id', categoriesController.categoryDetail);

export default route;