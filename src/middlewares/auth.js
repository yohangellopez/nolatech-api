const jwt = require('jsonwebtoken');
require('dotenv').config()
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const id = decodedToken.id;
    if (req.body.id && req.body.id !== id) {
      console.log('Invalid user ID');
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch(err) {
    console.log(err);
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};