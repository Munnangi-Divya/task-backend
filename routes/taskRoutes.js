
const router = require('express').Router()
const ctrl = require('../controllers/taskController')

router.post('/', ctrl.createTask)
router.get('/', ctrl.listTasks)
router.patch('/:id', ctrl.patchTask)
router.delete('/:id', ctrl.deleteTask)
router.get('/insights', ctrl.getInsights)

module.exports = router
