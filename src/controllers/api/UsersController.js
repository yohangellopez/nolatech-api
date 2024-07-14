require('dotenv').config()
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const Controller = require('../Controller');
class controller  extends Controller {
    constructor() {
        super();
        this.routes();
    }

    routes() {

        this.router.get('/', (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const count = parseInt(req.query.count) || 10;
            const offset = (page - 1) * count;
        
            try {
                this.database.query(`SELECT * FROM users LIMIT ? OFFSET ?`, 
                [count, offset], (err, rows) => {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error al obtener los usuarios',
                            error: err.message
                        });
                    }
        
                    // Obtener el total de usuarios para calcular el total de páginas
                    this.database.query(`SELECT COUNT(*) as total FROM users`, (err, totalResult) => {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error al obtener el total de usuarios',
                                error: err.message
                            });
                        }
        
                        const total = totalResult[0].total;
                        const totalPages = Math.ceil(total / count);
        
                        res.status(200).json({
                            message: 'Usuarios obtenidos correctamente.',
                            data: rows,
                            meta: {
                                currentPage: page,
                                totalPages: totalPages,
                                count: count,
                                totalUsers: total
                            }
                        });
                    });
                });
            } catch (err) {
                res.status(500).send(err.message);
            }
        });

        this.router.get('/:id', (req, res) => {
            const { id } = req.params;

            try {
                this.database.query(`SELECT * FROM users WHERE id = ?`,
                [id], (err, rows) => {
                    if (rows.length === 0) {
                        return res.status(400).json({
                            message: 'Datos de acceso incorrectos, usuario no se encuentra en la base de datos'
                        });
                    }
                    const user = rows[0]; 
                    res.
                        status(200).json({
                            message: 'Acceso correcto.',
                            data: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                lastname: user.lastname,
                                username: user.username,
                            }
                    });
                });
            } catch (err) {
                res.status(500).send(err.message);
            }
        })


        this.router.put('/:id', async (req, res) => {
            const { id } = req.params;
            const { name, lastname, username, password } = req.body;

            const schema = Joi.object({
                name: Joi.string().required(),
                lastname: Joi.string().required(),
                username: Joi.string().required(),
                password: Joi.string().required(),
            });

            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: true,
                    message: 'Datos de acceso incorrectos'
                });
            }
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            try {
                this.database.query(`UPDATE users
                SET name = ?, lastname = ?, username = ?, password = ?
                WHERE id = ?;`,
                    [name, lastname, username, hash, id], (err, rows) => {
                        if (err) {
                            res.status(400).send(err);
                        }
                        if (rows.affectedRows == 1)
                            res.status(200).json({ respuesta: 'Registro actualizado con éxito' });
                    })
            } catch (err) {
                res.status(500).send(err.message);
            }
        })

        this.router.delete('/:id', async (req, res) => {
            const { id } = req.params;
           
            try {
                this.database.query(`DELETE FROM users WHERE id = ?;`,
                    [id], (err, rows) => {
                        if (err) {
                            res.status(400).send(err);
                        }
                        if (rows.affectedRows == 1)
                            res.status(200).json({ respuesta: 'Registro eliminado con éxito' });
                    })
            } catch (err) {
                res.status(500).send(err.message);
            }
        })

        
        
    }
}
module.exports = new controller().router;