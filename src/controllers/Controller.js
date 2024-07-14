require('dotenv').config()
const { Router } = require('express');
var auth = require('../middlewares/auth');
const mysql2 = require('mysql2');
const jwt = require('jsonwebtoken');

class Controller {
    constructor() {
        this.database = require('../services/database');
        this.router = Router();
        this.mysql2 = mysql2;
        this.auth = auth;
    }
}
module.exports = Controller