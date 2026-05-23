import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";


//type ROLES= "maintainer" | "contributor";

const auth = (...roles: ROLES[]) => {
    
    return async (req: Request, res: Response, next: NextFunction) => {
        //console.log("This is protected Route");
        //console.log(req.headers.authorizaton);
        console.log(roles);

        try {
            const token = req.headers.authorization;
            console.log(token);

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: " Unauthorized access!"

                });
            }

            const decoded = jwt.verify(
                token as string,
                config.secret as string) as JwtPayload;
            console.log(decoded);
            const userData = await pool.query(
                `SELECT * FROM users WHERE email=$1
        
        `,
                [decoded.email],
            );
            //console.log(userData);
            const user = userData.rows[0];
            console.log(user);
            if (userData.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: " User not found!"

                });
            }



            //console.log("Auth Role : ", user.role);

            if(roles.length && !roles.includes(user.role)){

                res.status(403).json({
                    success: false,
                    message: " forbidden!"

                });

            }
            req.user = decoded

            next();

        } catch (error) {
            next(error)
        }
    }
}

export default auth 