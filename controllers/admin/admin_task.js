import { validationResult } from 'express-validator'
import { startSession } from 'mongoose'


import Task from "../../model/user/tasks.js"
import User from '../../model/user/user.js'

import { expressValidatorHelper, nodeMailerHelperFunc } from '../../middleware/helper.js'



export const adminAddTask = async (req, res) => {
    const { title, description } = req.body
    const userId = req.decodedUserId
    const result = validationResult(req)
    const { errorMessage } = expressValidatorHelper(result)
    if(errorMessage) {
        return res.status(422).json(`${errorMessage.msg} passed ${errorMessage.path}`)
    }

    let existingUser;
    try {
        existingUser = await User.findById({ _id: userId }).exec()
    } catch(err) {
        return res.status(500).json("Failed to get user.")
    }

    if(!existingUser) {
        return res.status(404).json("User not found.") 
    } 

    const newTask = new Task({
        title, 
        description,
        createdAt: new Date(),
        role: req.role,
        creatorId: existingUser._id
    })

    let savedTask;
    let sess
    try {
        sess = await startSession()
        sess.startTransaction()
        savedTask = await newTask.save({ session: sess })
        await sess.commitTransaction() 
        existingUser.tasks.push(savedTask._id)
        await existingUser.save({ session: sess })
        const email = existingUser.email
        const message = "You created a new task as an Admin."
        nodeMailerHelperFunc(email, message)
        return res.status(201).json("Task created successful")
    } catch(err) {
        return res.status(500).json("Internal Server Error") 
    }
}

export const adminGetTasks = async (req, res) => {
    const adminUserId = req.decodedUserId;

    let tasks;
    try {
        tasks = await Task.find()
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
    if(!tasks) {
        return res.status(404).json("No task is created yet.")
    }

    return res.status(200).json(tasks)
}


export const adminPutTask = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.decodedUserId
    const taskId = req.params.id
    if(taskId.length < 24) {
        return res.status(422).json("Invalid id provided.")
    }

    const errorResult = validationResult(req)
    const { errorMessage } = expressValidatorHelper(errorResult)
    if(errorMessage) {
        return res.status(422).json(`${errorMessage.msg} passed ${errorMessage.path}`)
    }

    let existingUser;
    try {
        existingUser = await User.findById(userId)
    } catch(err) {
        return res.status(500).json("Internal Server Error.")
    }

    if(!existingUser) {
        return res.status(404).json("User not found.")
    }
    
    let tasks;
    try {
        tasks = await Task.findById(taskId)
    } catch(err) {
        return res.status(500).json("Server Error")
    }
    if(!tasks) {
        return res.status(404).json("You don't have any task created.")
    }
    
    if(req.role !== "Admin") {
        return res.status(401).json("Unauthorize access. You are not allowed to access this route.")
    }

    try {
        tasks.title = title
        tasks.description = description
        await tasks.save()
        const email = existingUser.email
        const message = "You just updated your task."
        nodeMailerHelperFunc(email, message)
        return res.status(200).json("Task updated successfully.")
    } catch(err) {
        return res.status(500).json("Server Error")
    }
}


export const adminDeleteTask = async (req, res) => {
    const taskId = req.params.id

    let task;
    try {
        task = await Task.findById(taskId)
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }

    if(!task) {
        return res.status(404).json("Task not found.")
    }

    let existingUser
    try {
        const id = task.creatorId.toString()
        existingUser = await User.findById(id).populate("tasks") 
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }

    if(!existingUser) {
        return res.status(404).json("User not found.")
    }

    if(req.role !== "Admin") {
        return res.status(401).json("Unauthorize access. You are not allowed to access this route.")
    }

    try {
        await task.deleteOne()
        existingUser.tasks.pull(taskId)
        await existingUser.save() 
        return res.status(200).json("Your task was deleted successful.")
    } catch(err) {
        return res.status(500).json("Server Error")
    }
}