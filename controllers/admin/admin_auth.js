import { validationResult } from 'express-validator'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import "dotenv/config.js"


import AdminModel from '../../model/admin/admin.js'
import { expressValidatorHelper, nodeMailerHelperFunc } from '../../middleware/helper.js'


export const adminLogin = async (req, res) => {
    const { username, password } = req.body
    const errorResult = validationResult(req)
    const { errorMessage } = expressValidatorHelper(errorResult)
    if(errorMessage) {
        return res.status(422).json(`${errorMessage.msg} passed ${errorMessage.path}`)
    }

    let existingUsername;
    try {
        existingUsername = await AdminModel.findOne({ username })
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
    
    if(!existingUsername) {
        return res.status(404).json(
            "No account match this user. Register a new account"
        )
    }

    let hashedPassword;
    try {
        hashedPassword = await bcryptjs.compare(
            password, existingUsername.password)
    } catch(err) {
        return res.status(500).json("encrypting password failed")
    }

    if(!hashedPassword) {
        return res.status(404).json("Invalid credential enter.")
    }

    let token;
    try {
        token = jwt.sign({ email: existingUsername.email, 
            id: existingUsername._id }, 
            process.env.ADMIN_JWT_SECRET_TOKEN, { expiresIn: "1h"})
    } catch(err) { 
        return res.status(500).json("Server error")
    }

    if(!token) {
        return res.status(404).json("token not provided!")
    }

    const mail = existingUsername.email
    const message = "Your login as an admin was successful."
    nodeMailerHelperFunc(mail, message) 

    existingUsername.password = undefined;

    return res.status(200).json({ 
        id: existingUsername._id, 
        email: existingUsername.email,
        username: existingUsername.username,
        token
    })
}

export const adminRegister = async(req, res) => {
    const { email, username, password } = req.body
    email.toLowerCase()
    const errorResult = validationResult(req)
    const { errorMessage } = expressValidatorHelper(errorResult)
    if(errorMessage) {
        return res.status(422).json(`${errorMessage.msg} passed ${errorMessage.path}`)
    }

    try {
        const existingEmail = await AdminModel.findOne({ email })
        const existingUsername = await AdminModel.findOne({ username })
        if(existingEmail) {
            return res.status(400).json(`${
            existingEmail.email} already exist. Try login instead.`)
        }

        if(existingUsername) {
            return res.status(400).json(`${
            existingUsername.username} already exist. Try login instead.`)
        }
        
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }

    let hashedPassword;
    try {
        hashedPassword = await bcryptjs.hash(password, 12)
    } catch(err) {
        return res.status(500).json("encrypting password failed")
    }

    if(!hashedPassword) {
        return res.status(404).json("failed to register an account. Try again later.")
    }

    const createdAdminUser = new AdminModel({
        email,
        username,
        password: hashedPassword,
        tasks: []
    })

    let token;
    try {
        token = jwt.sign({ email: createdAdminUser.email, 
            id: createdAdminUser._id }, 
            process.env.ADMIN_JWT_SECRET_TOKEN, { expiresIn: "1h"})
    } catch(err) { 
        return res.status(500).json("Server error")
    }

    if(!token) {
        return res.status(404).json("token not provided!")
    }

    let savedUser;
    try {
        savedUser = await createdAdminUser.save();
    } catch(err) {
        return res.status(500).json("Failed to save user")
    }

    if(!savedUser) {
        return res.status(400).json("saving user failed.")
    }

    const mail = email
    const message = "Your account was created successfully as an admin."
    nodeMailerHelperFunc(mail, message)
    return res.status(201).json({ 
        email: savedUser.email, 
        username: savedUser.username, 
        id: savedUser._id, 
        token 
    })
}