const { bool } = require("joi")
const mongoose= require("mongoose")

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:String,
    status:String,
    // verified:bool,

})

module.exports=mongoose.model("User",userSchema)