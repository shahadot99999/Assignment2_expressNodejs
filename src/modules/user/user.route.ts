import { Router } from "express";
import { authController } from "./user.controller";

const router = Router()

router.post("/login", authController.loginUser);

export const authRoute = router