const express = require("express")
const app = express()
const Joi = require("joi")
const port = 3000
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const User = require("./users")
app.use(express.static("../"))
app.use(express.json())

// Routing Here? Maybe Somewhere...

const schema = Joi.object({
    email: Joi.string().email().required()
})
let email
app.post("/", (req, res) => {
    let { value, error } = schema.validate(req.body)
    if (!error) {
        res.status(200).json(value.email)
        email = value.email
        callDB()

    }
    else {
        res.status(400).json(error.details[0].message)
    }
})

// DB setup
async function connectToDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/netflix_auth")
        console.log("Connected to DB")
    } catch (err) {
        console.log("An error occured", err)
    }
}
connectToDB()
// Calling DB
const callDB = async () => {

    let currentUser = await User.findOne({ email: email })
    console.log(currentUser)
    if (!currentUser) {
        console.log("User does not exist yet")
        console.log("Creating new user")
        await User.create({ email: email, status: "UNVERIFIED" })
        console.log("User created")
        console.log(await User.findOne({ email: email }))
        currentUser = await User.findOne({ email: email })
    }
    else {
        console.log("User already exists,checking for status")
        switch (currentUser.status) {
            case "UNVERIFIED": {
                console.log("Email Not Verified")
                await User.updateOne({ email: email }, { status: "VERIFIED" })
                break
            }
            case "VERIFIED": {
                console.log("Verified")
                await User.updateOne({ email: email }, { status: "REGISTERED" })
                break
            }
            case "REGISTERED": {
                console.log("ALL SET")
                break
            }
        }
    }



}











// Sending Otp below

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "shubhuprodev@gmail.com",
//         pass: "tldtxtqfutevumjt"
//     }
// })

// async function otpSender(email){
//     const info = await transporter.sendMail({
//         from: `"Shubham <shubhuprodev@gmail.com>"`,
//         to: "shubhuisbetter@gmail.com",
//         text: "Why don't you try to walk 242125 steps today",
//         subject: "This is a fun message from a great Dev",
//     })
//     console.log("Message sent:", info.messageId)
// }

app.listen(port, () => {
    console.log("Listening to port:", port)
})