import { Router  } from "express";
import { userController } from "./auth.controller";



const router = Router()


//create users post method apply
router.post("/", userController.createUser )


export const userRoute = router