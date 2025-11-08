import { Router } from "express";
import { paymentCreate, paymentZalopay } from "./vnpayTest";

const router = Router();

router.post("/payment/create", paymentCreate)
router.post("/payment/zalo", paymentZalopay)
export default router;