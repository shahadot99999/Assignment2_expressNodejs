import type { Request, Response } from "express";
import { pool } from "../../db";
import { userService } from "./auth.service";

//create users post method apply
const createUser = async (req: Request, res: Response) => {
    //console.log(req.body);
    //const { name, email, password, role } = req.body;

    try {
       const result = await userService.createUserIntoDb(req.body)
        // console.log(result);

        res.status(201).json({
            success: true,
            message: " User Created successfully!",
            data: result.rows[0],
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });

    }
};

export const userController = {
    createUser,
}