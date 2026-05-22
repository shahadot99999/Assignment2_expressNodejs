import express, { type Application, type Request, type Response } from "express";
const app = express()
const port = 5000

app.get('/', (req :Request, res: Response) => {
  res.send('Hello World!')
})

app.listen(port, () => {
 console.log(`Assignment2 NodejsExpress app listening on port ${port}`)
})