const express = require("express")
const app = express()
const Joi = require("joi")
const port = 3000
const router = express.Router()
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const User = require("./users")
const path = require('path')
var otp
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, ".."))

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
    res.render(path.join(__dirname, "..", "signup"), { email })
})
app.get("/signup2", (req, res) => {
    // res.sendFile("../signup.html", { root: __dirname })
    res.render(path.join(__dirname, "..", "signup2"), { email })
})


app.get("/registerPass", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "registerPass.html"))
})
app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "success.html"))
})











const schema = Joi.object({
    email: Joi.string().email().required()
})
let email
app.post("/", async (req, res) => {
    let { value, error } = schema.validate(req.body)
    if (!error) {
        email = value.email
        console.log(email)
        let uri = await callDB()
        res.redirect(uri)
    }
    else {
        res.status(400).json(error.details[0].message)
    }
})
app.post('/signup', async (req, res) => {

    let uri = await callDB()
    res.redirect(uri)
})

app.post('/signup2', async (req, res) => {
    //    Currently unverfied

    let user = await User.findOne({ email })
    if (user.otp == req.body.otp) {

        await User.updateOne({ email }, { $set: { status: "VERIFIED" } })

        res.redirect('/registerPass')
    }
    else {
        res.status(400)
    }
})

app.post('/registerPass', async (req, res) => {
    console.log("setting password", req.body.pass)
    let password = req.body.pass
    await User.updateOne({ email }, { $set: { password, status: "REGISTERED" } })
    console.log("password set for user:", await User.findOne({ email }))
    res.redirect('/success')
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

    let currentUser = await User.findOne({ email })

    if (!currentUser) {
        // aka status:UNREGISTERED
        //Sending to verify and further process completion
        console.log("User does not exist yet")
        console.log("Creating new user")
        await User.create({ email, status: "UNVERIFIED" })
        console.log(await User.findOne({ email }))
        console.log("User created")
        return '/signup'

    }
    else {
        console.log("User already exists,checking for status")
        switch (currentUser.status) {
            case "UNVERIFIED": {
                otp = Math.floor((Math.random() * (1_000_000 - 100_000)) + 100_000)
                otpSender(email, otp)
                await User.updateOne({ email }, { $set: { otp } })

                console.log("Email Not Verified")
                return '/signup2'
            }
            case "VERIFIED": {
                console.log("Verified")
                return '/registerPass'
            }
            case "REGISTERED": {
                console.log("ALL SET")
                return '/success'
            }
        }
    }



}











// Sending Otp below

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shubhuprodev@gmail.com",
        pass: "tldtxtqfutevumjt"
    }
})

async function otpSender(email, otp) {
    const info = await transporter.sendMail({
        from: `"Shubham <shubhuprodev@gmail.com>"`,
        to: email,
        text: `Why don't you try to walk ${otp} steps today`,
        subject: "This is a fun message from a great Dev",
    })
    console.log("Message sent:", info.messageId)
}

app.listen(port, () => {
    console.log("Listening to port:", port)
})