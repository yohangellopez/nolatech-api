require('dotenv').config()
const { Router } = require('express');
const routers = Router();
const path = require('path');
const fs = require('fs');
// Public routes
routers.use('/', require('../controllers/HomeController'));
routers.use('/auth', require('../controllers/AuthController'));
// Export the routers
module.exports = routers;