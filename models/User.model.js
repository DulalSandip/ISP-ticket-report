const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
    },
    age:{
        type:Number,
        min:18,
        max:60,
    },
    gender:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
    

}) 

//generating bcrypt password
userSchema.pre('save',async function(next){
    try{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password,salt)
        this.password = hashedPassword
        next()

    }catch(error){
        next(error)
    }

})

// for comparing password between client side and database saved password

userSchema.methods.isValidPassword = async function(password){
    try{
        return await bcrypt.compare(password,this.password)
    }catch(error){
        throw error
    }
}


const User = mongoose.model('user',userSchema)
module.exports = User