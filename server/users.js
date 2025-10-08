const { bool, number } = require("joi")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,
    status: String,
    otp: Number,
    // verified:bool,

})

module.exports = mongoose.model("User", userSchema)