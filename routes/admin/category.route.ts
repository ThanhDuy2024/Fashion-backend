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

route.patch('/edit/:id', upload.single('image'), validate.categoriesValidate, categoriesController.categoryEdit);

route.get('/tree', categoriesController.categoriesTree);

route.delete('/delete/:id', categoriesController.categoryDelete);

route.get('/trash/list', categoriesController.categoryTrashList);

route.patch('/trash/restore/:id', categoriesController.categoriesTrashRestore);

route.delete('/trash/delete/:id', categoriesController.categoriesTrashDelete);

export default route;