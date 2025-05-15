import mongoose from 'mongoose'


const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    tasks: [
        { type: mongoose.Schema.Types.ObjectId, trim: true, ref: "AdminTask" }
    ]
})

const admin = mongoose.model("Admins", adminSchema)

export default admin;