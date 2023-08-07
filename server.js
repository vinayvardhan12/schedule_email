const express = require("express")
const routes = require('./src/students/routes')
const app = express();
const PORT =3000

// app.get("/",(req,res)=>{
//     res.send("hello world");
// })
app.use(express.json());

app.use("/api/v1/email",routes)
app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))