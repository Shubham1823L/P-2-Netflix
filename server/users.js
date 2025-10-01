const { required } = require("joi")
const mongoose= require("mongoose")

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:String,
    
})

module.exports=mongoose.model("User",userSchema)