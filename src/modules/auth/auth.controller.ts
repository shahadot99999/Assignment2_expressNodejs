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



//all users get method apply
const getAllUsers = async (req: Request, res: Response) => {
    try {
       const result = await userService.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: " Users retrived successfully!",
            data: result.rows,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}


const getSingleUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    //console.log(id);
    try {
        
      const result = await userService.getSingleUsersFromDB(id as string);

        //console.log(result);
        if (result.rows.length === 0) {

            res.status(404).json({
                success: false,
                message: " User Not Found!",
                data: {},
            })
        }

        res.status(200).json({
            success: true,
            message: " Users retrived successfully!",
            data: result.rows,
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }

}


const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    //  const { name, password, age, is_active } = req.body;
    const { name, password, role } = req.body;

    // console.log("Id: ", id);
    // console.log({name, password, age, is_active});

    try {
       const result = await userService.updateUsersFromDB(req.body, id as string);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: " User Not Found!"

            })
        }

        // console.log(result);
        res.status(200).json({
            success: true,
            message: " Users updated successfully!",
            data: result.rows[0],
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        })
    }
}

const deleteUser = async(req : Request, res: Response)=>{
  const {id}= req.params;

  try {
   
  const result = await userService.deleteUsersFromDB(id as string);

  if(result.rowCount ===0){
    res.status(404).json({
        success: false,
        message: " User Not Found!"
        
      })
  }

  res.status(200).json({
    success: true,
    message: " Users Deleted successfully!",
    data: {},
  });
    
  } catch (error: any) {
    res.status(500).json({
        success: false,
        message: error.message,
        error : error,
      })
  }
}



export const userController = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser
}