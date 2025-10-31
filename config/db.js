
const mongoose = require('mongoose')

const connectDB = async (uri) => {
  const MONGO = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/tasktracker'
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Mongo connected')
  } catch (err) {
    console.error('Mongo connection error', err)
    process.exit(1)
  }
}

module.exports = connectDB
