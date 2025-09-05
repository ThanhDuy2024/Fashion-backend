import { Router } from "express";
import * as productController from "../../controllers/admin/product.controller";
import { storage } from "../../helpers/cloudinary.helper";
import multer from "multer";
import { productValidate } from "../../validates/product.validate";
const route = Router();

const upload = multer({
  storage: storage
})

route.post('/create', upload.single("image"), productValidate, productController.create);

route.get('/list', productController.list);

route.get('/detail/:id', productController.deltail);

route.patch('/edit/:id', upload.single("image"), productValidate, productController.edit);

route.delete('/delete/:id', productController.deleteSoft);

route.get('/trash/list', productController.trashList);
export default route;