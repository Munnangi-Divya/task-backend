const Task = require('../models/Task')
const mongoose = require('mongoose')

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body
    if (!title || !title.trim()) return res.status(400).json({ error: 'title required' })
    const task = new Task({
      title: title.trim(),
      description: description || '',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : null
    })
    await task.save()
    res.status(201).json(task)
  } catch (e) {
    res.status(500).json({ error: 'server error' })
  }
}

exports.listTasks = async (req, res) => {
  try {
    const { status, priority, sort, page, limit } = req.query
    const q = {}
    if (status) q.status = status
    if (priority) q.priority = priority
    let query = Task.find(q)
    if (sort === 'dueAsc') query = query.sort({ dueDate: 1 })
    else if (sort === 'dueDesc') query = query.sort({ dueDate: -1 })
    else query = query.sort({ createdAt: -1 })
    const p = Math.max(parseInt(page || '1', 10), 1)
    const l = Math.min(Math.max(parseInt(limit || '50', 10), 1), 200)
    query = query.skip((p - 1) * l).limit(l)
    const tasks = await query.exec()
    res.json(tasks)
  } catch (e) {
    res.status(500).json({ error: 'server error' })
  }
}

exports.patchTask = async (req, res) => {
  try {
    const id = req.params.id
    const patch = {}
    if ('status' in req.body) patch.status = req.body.status
    if ('priority' in req.body) patch.priority = req.body.priority
    if ('title' in req.body) patch.title = req.body.title
    if ('description' in req.body) patch.description = req.body.description
    if ('dueDate' in req.body) patch.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'nothing to update' })
    const task = await Task.findOneAndUpdate({ _id: id }, patch, { new: true })
    if (!task) return res.status(404).json({ error: 'not found' })
    res.json(task)
  } catch (e) {
    res.status(500).json({ error: 'server error' })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const id = req.params.id
    const task = await Task.findByIdAndDelete(id)
    if (!task) return res.status(404).json({ error: 'not found' })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'server error' })
  }
}

exports.getInsights = async (req, res) => {
  try {
    const now = new Date()
    const in7 = new Date()
    in7.setDate(now.getDate() + 7)
    const total = await Task.countDocuments({})
    const open = await Task.countDocuments({ status: { $ne: 'Done' } })
    const byPriorityAgg = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])
    const dueSoon = await Task.countDocuments({ dueDate: { $gte: now, $lte: in7 } })
    const byPriority = byPriorityAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count
      return acc
    }, {})
    const busiestDayAgg = await Task.aggregate([
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: { $ifNull: ['$dueDate', now] } } } } },
      { $group: { _id: '$day', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ])
    const busiestDay = busiestDayAgg.length ? busiestDayAgg[0]._id : null
    let dominant = 'None'
    const priorities = ['High','Medium','Low']
    let max = 0
    priorities.forEach(p => {
      const c = byPriority[p] || 0
      if (c > max) { max = c; dominant = p }
    })
    const summary = `You have ${total} tasks, ${open} open. Most tasks are ${dominant}. ${dueSoon} due within 7 days.`
    res.json({ total, open, byPriority, dueSoon, busiestDay, summary })
  } catch (e) {
    res.status(500).json({ error: 'server error' })
  }
}
