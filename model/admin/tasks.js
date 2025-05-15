import mongoose from 'mongoose'


const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    createdAt: { type: Date, required: true, trim: true },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, ref: "Admin"
    }
})

const task = mongoose.model("AdminTask", taskSchema)

export default task;