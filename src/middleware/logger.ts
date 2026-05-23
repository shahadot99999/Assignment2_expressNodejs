import  fs  from 'fs';
import type { NextFunction, Request, Response } from "express";


const logger = (req : Request, res: Response, next : NextFunction)=>{
    console.log("Method -URL - Time", req.method, req.url, Date.now());
    const log =`\n Method -> ${req.method} -  Time ->${Date.now()} -
    URL ->${req.url}\n` ;
    fs.appendFile("logger.txt", log, (err)=>{
        //console.log(err);
    })
    next();
}

export default logger