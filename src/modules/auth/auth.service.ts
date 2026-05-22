import { pool } from "../../db";
import type { IUser } from "./auth.interface";

import bcrypt from "bcryptjs";

const createUserIntoDb=async(payLoad: IUser)=>{
    const {name, email, password, role}=payLoad

     const hasPassword= await bcrypt.hash(password, 10)

     const result = await pool.query(`
     INSERT INTO users(name, email, password, role)
       VALUES($1, $2, $3, $4)
       RETURNING *
      `,
            [name, email, hasPassword, role],
        );

        delete result.rows[0].password;

        return result;
};

const getAllUsersFromDB = async()=>{
     const result = await pool.query(`
     
      SELECT * FROM users
      `);
      return result;
};


const getSingleUsersFromDB = async(id : string)=>{
    const result = await pool.query(`
     SELECT * FROM users WHERE id=$1 
      `,
            [id],

        );
        return result;
}


const updateUsersFromDB = async (payLoad: IUser, id: string) => {

    const {name, password, role}= payLoad;

    const result = await pool.query(

        `
        UPDATE users 
          SET 
          name=COALESCE($1, name),
           password=COALESCE($2, password), 
            role=COALESCE($3, role)
 
          WHERE id=$4
           RETURNING *
  
             `,
        [name, password, role, id],
    );
    return result;

}

const deleteUsersFromDB = async(id : string)=>{
     const result = await pool.query(
      `
      DELETE FROM users WHERE id=$1
      `,
    [id],
  );
  return result;
}

export const userService={
    createUserIntoDb,
    getAllUsersFromDB,
    getSingleUsersFromDB,
    updateUsersFromDB,
    deleteUsersFromDB

}


