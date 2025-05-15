import express from 'express'
import { check } from 'express-validator'


import { adminLogin, adminRegister } from '../controllers/admin/admin_auth.js'
// import { adminAddTask, adminGetTasks, adminPutTask, adminDeleteTask } from '../controllers/admin/admin_task.js'
import adminAuthJwt from '../middleware/admin_jwt.js'


const router = express.Router()

//post route => /admin/login
router.post("/login", check("password").notEmpty().isLength({ min: 6 }), 
    check("username").notEmpty().isLength({ min: 4 }), adminLogin)

//post route => /admin/register
router.post("/register", check("email").isEmail().normalizeEmail(),
    check("password").notEmpty().isLength({ min: 6 }), 
    check("username").notEmpty().isLength({ min: 4 }), adminRegister)

//post route => /admin/tasks
// router.post("/tasks", adminAuthJwt, check("title").notEmpty(), 
//     check("description").notEmpty(), adminAddTask)

//get route => /admin/get
// router.get("/tasks", adminAuthJwt, adminGetTasks)

//put route => /admin/put/:id
// router.put("/tasks/:id", adminAuthJwt,
//     check("title").notEmpty().isLength({ min: 5 }),
//     check("description").notEmpty().isLength({ min: 4 }), adminPutTask)

//delete route => /admin/task/:id
// router.delete("/tasks/:id", adminAuthJwt, adminDeleteTask)


export default router;