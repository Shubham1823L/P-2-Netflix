const express = require("express")
const app = express()
const Joi = require("joi")
const port = 3000
const router = express.Router()
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const User = require("./users")
const path = require('path')

app.set('view engine','ejs')
app.set('views',path.join(__dirname,".."))

app.use(express.static("../"))

app.use(express.json())

// Routing Here? Maybe Somewhere...
app.get("/", (req, res) => {
    // res.sendFile("../index.html", { root: __dirname })
    res.sendFile(path.join(__dirname, "..", "index.html"))
})

app.get("/signup", (req, res) => {
    // res.sendFile("../signup.html", { root:path.dirname(__dirname)  })
    // res.sendFile(path.join(__dirname, "..", "signup.html"))
    res.render(path.join(__dirname, "..", "signup"),{email})
})
app.get("/signup2", (req, res) => {
    // res.sendFile("../signup.html", { root: __dirname })
    res.render(path.join(__dirname, "..", "signup2"),{email})
})














const schema = Joi.object({
    email: Joi.string().email().required()
})
let email
app.post("/", (req, res) => {
    let { value, error } = schema.validate(req.body)
    if (!error) {
        email = value.email
        callDB()
        res.redirect("/signup")
    }
    else {
        res.status(400).json(error.details[0].message)
    }
})
app.post('/signup',(req,res)=>{
    res.redirect("/signup2")
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
//         to: "prathamgupta.wk@gmail.com",
//         text: "Why don't you try to walk 242125 steps today",
//         subject: "This is a fun message from a great Dev",
//     })
//     console.log("Message sent:", info.messageId)
// }

app.listen(port, () => {
    console.log("Listening to port:", port)
})