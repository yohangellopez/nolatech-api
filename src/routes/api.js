require('dotenv').config()
const { Router } = require('express');
const routers = Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/auth');
// Public routes
pathControllers = path.join(__dirname,'/../controllers/api');
fs.readdirSync(path.join(pathControllers)).forEach(file => {
    console.log('Api/'+file);
    if(file.replace('Controller.js', '').toLowerCase() != 'home') {
        routers.use('/'+file.replace('Controller.js', '').toLowerCase(), auth, require(path.join(pathControllers, file)));
    } else {
        routers.use('/'+file.replace('Controller.js', '').toLowerCase(), auth,  require(path.join(pathControllers, file)));
    }
});
// Export the routers
module.exports = routers