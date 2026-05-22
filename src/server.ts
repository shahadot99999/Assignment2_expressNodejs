import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";
import config from "./config";

const app: Application = express()
//const port = config.port
const port = 5000;


app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }))

//database neon connection
const pool = new Pool({
    connectionString: config.connection_string,
});

//table Create
const initDB = async () => {
    try {
        // 1. Create Users Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // 2. Create Issues Table (Needed for tomorrow)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Database connection successfully!");
    } catch (error) {
        console.log(error);
    }
};

initDB();

//browser loading
app.get('/', (req: Request, res: Response) => {
    //res.send('Express Server');
    res.status(200).json({
        message: "Express Server",
        "author": "Cute Programer",
    })
})




//create users post method apply
app.post("/api/users", async (req: Request, res: Response) => {
    //console.log(req.body);
    const { name, email, password, role } = req.body;

    try {
        const result = await pool.query(`
     INSERT INTO users(name, email, password, role)
       VALUES($1, $2, $3, $4)
       RETURNING *
      `,
            [name, email, password, role],
        );
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
})

//all users
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
     
      SELECT * FROM users
      `);
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
})

//single users
app.get('/api/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    //console.log(id);
    try {
        const result = await pool.query(`
     SELECT * FROM users WHERE id=$1 
      `,
            [id],

        );


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

})

//update users
app.put("/api/users/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    //  const { name, password, age, is_active } = req.body;
    const { name, password, role } = req.body;

    // console.log("Id: ", id);
    // console.log({name, password, age, is_active});

    try {
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
});




app.listen(port, () => {
    console.log(`Assignment2 NodejsExpress app listening on port ${port}`)
})