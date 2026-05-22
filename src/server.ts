import config from "./config";
import { initDB } from "./db";
import app from "./app";

const port = 5000;

const main=()=>{
    //database and table neoan created.
    initDB();
    app.listen(port, () => {
    console.log(`Assignment2 NodejsExpress app listening on port ${port}`)
});
};

main();
