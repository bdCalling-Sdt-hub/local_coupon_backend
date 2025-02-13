import { Router } from "express";
import { signup, verify_otp } from "@controllers/auth";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp", verify_otp);

export default router;
