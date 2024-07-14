require('dotenv').config()
const Controller = require('./Controller');
class controller  extends Controller {
    constructor() {
        super();
        this.routes();
    }

    routes() {
        
        this.router.get('/', async (req, res) => {
            res.status(200).json({'message':process.env.APP_NAME, params: req.params,query: req.query});
        })
    }
}
module.exports = new controller().router;