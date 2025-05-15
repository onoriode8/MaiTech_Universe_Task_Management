import { validationResult } from 'express-validator'
import { startSession } from 'mongoose'


import User from '../../model/user/user.js'
import Task from "../../model/user/tasks.js"

import { expressValidatorHelper, nodeMailerHelperFunc } from '../../middleware/helper.js'
import { getIo } from '../../socket.io.js'


export const addTask = async (req, res) => {
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
        //emit event to all user for created task.
        getIo().emit("Task_Created", {
            title, description
        })
        const email = existingUser.email
        const message = "Your created a new task."
        nodeMailerHelperFunc(email, message)
        return res.status(201).json("Task created successful")
    } catch(err) {
        return res.status(500).json("Internal Server Error") 
    }
}

export const getTasks = async (req, res) => {
    const userId = req.decodedUserId;

    let tasks;
    try {
        tasks = await User.findById({ _id: userId })
            .select("-password").populate("tasks").exec()
    } catch(err) {
        return res.status(500).json(err.message)
    }
    if(!tasks) {
        return res.status(404).json("No task is created yet.")
    }

    return res.status(200).json(tasks)
}


export const putTask = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.decodedUserId //from jwt middleware
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
    
    if(existingUser._id.toString() !== tasks.creatorId.toString()) {
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

export const deleteTask = async (req, res) => {
    const taskId = req.params.id
    const userId = req.decodedUserId

    let existingUser
    try {
        existingUser = await User.findById(userId).populate("tasks")
    } catch(err) {
        return res.status(500).json("Internal Server Error")
    }
    if(!existingUser) {
        return res.status(404).json("User not found.")
    }
    console.log("EXISTING_USER", existingUser)

    try {
        const sess = await startSession()
        sess.startTransaction()
        const task = await Task.findById(taskId)
        if(!task) {
            return res.status(404).json("You don't have any task to delete.")
        }

        if(existingUser._id.toString() !== task.creatorId.toString()) {
            return res.status(401).json("Unauthorize access. You are not allowed to access this route.")
        }
        console.log('EXISTING_USER', existingUser.tasks)
        await sess.commitTransaction()
        await task.remove({ session: sess })
        existingUser.tasks.pull(taskId) // check if it works later.
        console.log("TASK REMOVED", task)
        await Promise.all([
            await existingUser.save({ session: sess }),
            await task.save({ session: sess })
        ])
        return res.status(200).json("Your task was deleted successful.")
    } catch(err) {
        return res.status(500).json("Server Error")
    }
}