const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const taskRoutes = require('./routes/taskRoutes')

dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(bodyParser.json())

connectDB(process.env.MONGO_URI)

app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log('Server running on', PORT))
