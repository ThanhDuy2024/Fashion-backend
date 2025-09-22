import { Router } from "express";
import * as branchController from "../../controllers/clients/branch.controller";
const route = Router();

route.get('/list', branchController.getAllBranch);

export default route;