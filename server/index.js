require('dotenv').config()
const express = require("express")
const app = express()
const Joi = require("joi")
const port = 3000
const router = express.Router()
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const User = require("./users")
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

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
    res.render(path.join(__dirname, "..", "success"), { email })
})
app.get("/signIn", (req, res) => {
    res.render(path.join(__dirname, "..", "signIn"), { email })
})
app.get('/auth', auth, (req, res) => {
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
    const password = req.body.pass
    const hashedPassword = await bcrypt.hash(password, 10)

    await User.updateOne({ email }, { $set: { password: hashedPassword, status: "REGISTERED" } })
    console.log("password set for user:", await User.findOne({ email }))
    res.redirect('/success')
})
app.post('/signIn', async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({ email })
    if (user == null) return res.status(400).redirect('/')
    const currentPass = req.body.password
    const actualPass = user.password
    try {
        if (await bcrypt.compare(currentPass, actualPass)) {
            const payload = { email }
            const accessToken = generateAccessToken(payload)
            const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: "lax"
            })
            res.status(200).json({ redirect: '/success', accessToken })
        }
        else {
            res.status(400).redirect('/signIn')
        }

    } catch (err) {
        res.status(500).redirect('/signIn')
        console.log(err)
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
                return '/signIn'
            }
        }
    }



}




const generateAccessToken = payload => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })







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



function auth(req, res, next) {
    console.log("Authorizing...")
    const receivedAccessToken = req.headers['authorization'].split(' ')[1]
    if (!receivedAccessToken) {
        console.log('Error occured while accessing token')
        return next()
    }
    jwt.verify(receivedAccessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        console.log("inside jwt.verify() callback")
        if (err) {
            console.log("authentication failed")
            res.status(403)
            return

        }
        console.log(payload)
        res.status(200).send('ok')

    })
}