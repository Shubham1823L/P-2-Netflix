const express = require("express")
const app = express()
const router = express.Router()
const Joi = require("joi")
const port = 3000
app.use(express.static("../"))
app.use(express.json())
app.get("/", (req, res) => {
    console.log("HAHAHAH")
    res.status(200).sendFile("../index.html", { root: __dirname })
})
app.get("/signup", (req, res) => {
    console.log("YO")
    res.sendFile("../signup.html", { root: __dirname })
})
app.post("/", (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    })
    let { value, error } = schema.validate(req.body)
    if (!error) {
        res.status(200).json(value)
    }
    else {
        res.status(400).json(error.details[0].message)
    }
})
app.listen(port, () => {
    console.log("Listening to port:", port)
})