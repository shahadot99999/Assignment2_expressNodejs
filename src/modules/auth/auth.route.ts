import { Router  } from "express";
import { userController } from "./auth.controller";
import auth from "../../middleware/auth";



const router = Router()




//create users post method apply
router.post("/", userController.createUser );

//all users get method apply and middleware set up
router.get('/', auth(), userController.getAllUsers );

//single users get method apply
router.get('/:id', userController.getSingleUser )


//update users
router.put("/:id", userController.updateUser);


//delete users
router.delete("/:id", userController.deleteUser );


export const userRoute = router