import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    tasks: [
        { type: mongoose.Schema.Types.ObjectId, trim: true, ref: "Task" }
    ]
})

const user = mongoose.model("User", userSchema)

export default user;