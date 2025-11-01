const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/userController');
const { validateObjectIdParams } = require('../middlewares/validation');

// User routes
router.get('/', getUsers);
router.get('/:id', validateObjectIdParams('id'), getUserById);
router.post('/', createUser);

module.exports = router;
