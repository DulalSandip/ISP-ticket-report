require("dotenv").config();
const express = require('express')
const morgan = require('morgan')
const createErrors = require('http-errors')

const authRoute = require('./routes/Auth.route')
require('./helpers/db_connection')
const{ verifyAccessToken } = require('./helpers/jwt_helper')




const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))


app.get('/auth',verifyAccessToken,async(req,res,next)=>{
    //console.log(req.headers['authorization'])
    res.send("this is home page")
})

app.use('/auth',authRoute)


// handle or throw the errors, if no proper url is set
app.use(async(req,res,next)=>{
    next(createErrors.NotFound())

})

app.use(async(err,req,res,next)=>{
    res.status(err.status || 500)
    res.send({
        error:{
            status: err.status || 500,
            message: err.message
        }
    })
})





const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})