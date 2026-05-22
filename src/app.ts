import express, { type Application, type Request, type Response } from "express";
//import { Pool } from "pg";
//import config from "./config";
import { initDB, pool } from "./db";
import { userRoute } from "./modules/auth/auth.route";
import { authRoute } from "./modules/user/user.route";
//import { initDB, pool } from "./db";

const app: Application = express()
//const port = config.port
//const port = 5000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }))

//browser loading
app.get('/', (req: Request, res: Response) => {
    //res.send('Express Server');
    res.status(200).json({
        message: "Express Server",
        "author": "Cute Programer",
    })
})


app.use("/api/users", userRoute);

app.use("/api/auth", authRoute )


export default app 