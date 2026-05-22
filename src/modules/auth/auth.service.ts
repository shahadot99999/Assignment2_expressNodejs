import { pool } from "../../db";
import type { IUser } from "./auth.interface";

const createUserIntoDb=async(payLoad: IUser)=>{
    const {name, email, password, role}=payLoad
     const result = await pool.query(`
     INSERT INTO users(name, email, password, role)
       VALUES($1, $2, $3, $4)
       RETURNING *
      `,
            [name, email, password, role],
        );
        return result
};


export const userService={
    createUserIntoDb,
}


