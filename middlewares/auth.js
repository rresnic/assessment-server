const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Extract token from 'Authorization' header

    if (!token) {
        return res.status(403).json({ message: 'Token is required for authentication.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};


module.exports = { verifyToken };
