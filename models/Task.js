
const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium', index: true },
  status: { type: String, enum: ['Todo','InProgress','Done'], default: 'Todo', index: true },
  dueDate: { type: Date, default: null, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

TaskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() })
  next()
})

module.exports = mongoose.model('Task', TaskSchema)
