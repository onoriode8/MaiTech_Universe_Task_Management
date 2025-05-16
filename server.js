import express  from "express"
import { connect } from 'mongoose'
import cors from 'cors'
import "dotenv/config.js"

import userRoutes from './routes/user_routes.js'
import adminRoutes from "./routes/admin_routes.js"
import { init } from "./socket.io.js"


const server = express()

server.use(express.json())

server.use(cors({
    origin: "http://localhost:3000", //Frontend Url
    methods: ["GET, POST, PUT, PATCH, DELETE"]
}))

server.use("/user", userRoutes)

server.use("/admin", adminRoutes)

server.use((req, res) => {
    return res.status(404).json("Page not found!")
})

server.use((error, req, res, next) => {
    console.log("Catch Error that occurs.")
})

const MONGO_DB_URL = "mongodb+srv://task_management:mQXWJKu0N2gfO8rw@cluster0.e3pic.mongodb.net/TaskManagement"
const NODE_ENV = "Production"

connect(MONGO_DB_URL)
    .then(response => {
        const httpServer = server.listen(8000, () => {
            {NODE_ENV === "development" ?
                console.log(`app is running on port "http://localhost:8000"`) 
                :
                console.log("Running on production.")
            }
        })
        const io = init(httpServer)
        io.on("connection", (socket) => {
            console.log("connected to socket", `${socket.id}`)
            socket.on("disconnect", () => {
                console.log("Socket disconnect.");
            })
        })
    })
    .catch(err => {
        if(NODE_ENV === "development") {
            console.log("error", err.message)
        }
    })