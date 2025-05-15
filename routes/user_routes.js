import express from 'express'
import { check } from 'express-validator'


import { login, register } from '../controllers/user/authentication.js'
import { addTask, getTasks, putTask, deleteTask } from '../controllers/user/task.js'
import authJwt from '../middleware/jwt.js'
import authorize from '../middleware/authorize.js'

const router = express.Router()

//post route => /user/login
router.post("/login", check("password").notEmpty().isLength({ min: 6 }), 
    check("username").notEmpty().isLength({ min: 4 }), login)

//post route => /user/register
router.post("/register", check("email").isEmail().normalizeEmail(),
    check("password").notEmpty().isLength({ min: 6 }), 
    check("username").notEmpty().isLength({ min: 4 }), register)

//post route => /user/tasks
router.post("/tasks", authJwt, authorize(["Member"]),
     check("title").notEmpty(), 
    check("description").notEmpty(), addTask)

//get route => /user/get
router.get("/tasks", authJwt, 
    authorize(["Member"]), getTasks)

//put route => /user/put/:id
router.put("/tasks/:id", authJwt, authorize(["Member"]),
    check("title").notEmpty().isLength({ min: 5 }),
    check("description").notEmpty().isLength({ min: 4 }), putTask)

//delete route => /user/task/:id
router.delete("/tasks/:id", authJwt, 
    authorize(["Member"]), deleteTask)


export default router;