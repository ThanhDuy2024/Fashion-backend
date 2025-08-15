import { Request, Response, Router } from "express";
import accountAdminRoute from "./accountAdmin.route";
const route = Router();

route.use('/account', accountAdminRoute);

export default route;