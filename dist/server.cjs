
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var import_pg = require("pg");
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
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

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/modules/auth/auth.route.ts
var import_express = require("express");

// src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var createUserIntoDb = async (payLoad) => {
  const { name, email, password, role } = payLoad;
  const hasPassword = await import_bcryptjs.default.hash(password, 10);
  const result = await pool.query(
    `
     INSERT INTO users(name, email, password, role)
       VALUES($1, $2, $3, $4)
       RETURNING *
      `,
    [name, email, hasPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
     
      SELECT * FROM users
      `);
  return result;
};
var getSingleUsersFromDB = async (id) => {
  const result = await pool.query(
    `
     SELECT * FROM users WHERE id=$1 
      `,
    [id]
  );
  return result;
};
var updateUsersFromDB = async (payLoad, id) => {
  const { name, password, role } = payLoad;
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
    [name, password, role, id]
  );
  return result;
};
var deleteUsersFromDB = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM users WHERE id=$1
      `,
    [id]
  );
  return result;
};
var userService = {
  createUserIntoDb,
  getAllUsersFromDB,
  getSingleUsersFromDB,
  updateUsersFromDB,
  deleteUsersFromDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDb(req.body);
    res.status(201).json({
      success: true,
      message: " User Created successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  console.log("Controller", req.user);
  try {
    const result = await userService.getAllUsersFromDB();
    res.status(200).json({
      success: true,
      message: " Users retrived successfully!",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.getSingleUsersFromDB(id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: " User Not Found!",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: " Users retrived successfully!",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, password, role } = req.body;
  try {
    const result = await userService.updateUsersFromDB(req.body, id);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: " User Not Found!"
      });
    }
    res.status(200).json({
      success: true,
      message: " Users updated successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUsersFromDB(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: " User Not Found!"
      });
    }
    res.status(200).json({
      success: true,
      message: " Users Deleted successfully!",
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var auth = (...roles) => {
  return async (req, res, next) => {
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
      const decoded = import_jsonwebtoken.default.verify(
        token,
        config_default.secret
      );
      console.log(decoded);
      const userData = await pool.query(
        `SELECT * FROM users WHERE email=$1
        
        `,
        [decoded.email]
      );
      const user = userData.rows[0];
      console.log(user);
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: " User not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: " forbidden!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor"
};

// src/modules/auth/auth.route.ts
var router = (0, import_express.Router)();
router.post("/auth/signup", userController.createUser);
router.get("/", auth_default(USER_ROLE.maintainer, USER_ROLE.contributor), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRoute = router;

// src/modules/user/user.route.ts
var import_express2 = require("express");

// src/modules/user/user.service.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var loginUserIntoDB = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await import_bcryptjs2.default.compare(password, user.password);
  console.log("Do plain text passwords match?:", matchPassword);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = import_jsonwebtoken2.default.sign(JwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  loginUserIntoDB
};

// src/modules/user/user.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: " User logih successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser
};

// src/modules/user/user.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/login", authController.loginUser);
var authRoute = router2;

// src/middleware/logger.ts
var import_fs = __toESM(require("fs"), 1);
var logger = (req, res, next) => {
  console.log("Method -URL - Time", req.method, req.url, Date.now());
  const log = `
 Method -> ${req.method} -  Time ->${Date.now()} -
    URL ->${req.url}
`;
  import_fs.default.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var app = (0, import_express3.default)();
app.use((0, import_cookie_parser.default)());
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({ extended: true }));
app.use(logger_default);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server",
    "author": "Cute Programer"
  });
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
var app_default = app;

// src/server.ts
var port = 5e3;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Assignment2 NodejsExpress app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map