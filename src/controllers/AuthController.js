require('dotenv').config()
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const Controller = require('./Controller');
class controller  extends Controller {
    constructor() {
        super();
        this.routes();
    }

    routes() {

        this.router.post('/login', (req, res) => {
            const { email, password } = req.body;
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            });
            const { error } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                });
            }
           
            try {
                this.database.query(`SELECT * FROM users WHERE email = ?`,
                [email], (err, rows) => {
                    console.log(rows);
                    if (rows && rows.length === 0) {
                        return res.status(400).json({
                            message: 'Datos de acceso incorrectos, su correo no se encuentra en la base de datos'
                        });
                    }
                    bcrypt.compare(password, rows[0].password, (err, isMatch) => {
                        if (err) {
                            return res.status(400).json({
                                message: 'Datos de acceso incorrectos'
                            });
                        }
                        if (!isMatch) {
                            return res.status(400).json({
                                message: 'Datos de acceso incorrectos'
                            });
                        }
                        const user = rows[0]; 
                        const token = jwt.sign({
                            id: user.id,
                            // a mounth future expires
                            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)
                        }, process.env.JWT_SECRET);

                        res.
                        header('auth-token', token).
                        status(200).json({
                            message: 'Acceso correcto.',
                            token: token,
                            data: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                lastname: user.lastname,
                                username: user.username,
                            }
                        });
                    });
                });
            } catch (err) {
                res.status(500).send(err.message);
            }
        })

        this.router.post('/register', async (req, res) => {
            const { name, lastname, email, username, password } = req.body;
            const schema = Joi.object({
                name: Joi.string().required(),
                lastname: Joi.string().required(),
                username: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            });
            const { error } = schema.validate(req.body);
            if(error)res.status(400).json({message: error.details[0].message});
            // encrypt password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            try {
                this.database.query(`INSERT INTO users
                        (id, name, lastname, email, username,password)
                        VALUES(NULL, ?, ?, ?,?, ?);`,
                [name, lastname, email, username, hash], (err, rows) => {
                    if (err) {
                        res.status(400).send(err);
                    }
                    if (rows.insertId)
                        this.database.query(`SELECT * FROM users WHERE id = ?`,
                            [rows.insertId], (err, rows) => {
                            if (rows.length === 0) {
                                return res.status(400).json({
                                    message: 'Datos de acceso incorrectos, usuario no se encuentra en la base de datos'
                                });
                            }
                            const user = rows[0]; 
                            const token = jwt.sign({
                                id: user.id,
                                // a mounth future expires
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)
                            }, process.env.JWT_SECRET);
    
                            res.
                            header('auth-token', token).
                            status(200).json({
                                message: 'Acceso correcto.',
                                token: token,
                                data: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    lastname: user.lastname,
                                    username: user.username,
                                }
                            });
                    });
                });
            } catch (err) {
                res.status(500).send(err.message);
            }
        });
        
    }
}
module.exports = new controller().router;