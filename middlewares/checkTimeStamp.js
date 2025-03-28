const jwt = require('jsonwebtoken');

const checkTimestampMiddleware = (req, res, next) => {
    const { timeToken } = req.body; 
    if (!timeToken) {
        return res.status(400).json({ message: 'Missing timestamp', errors: 'timestamp' });
    }

    try {
        const decoded = jwt.verify(timeToken, process.env.JWT_SECRET);

        const formLoadTime = decoded.timeToken;
        const currentTime = Date.now();

        const timeDifference = currentTime - formLoadTime;

        if (timeDifference < 3000) {  
            return res.status(400).json({ message: 'Form submitted too quickly. Please take your time.', errors: 'timestamp' });
        }

        if (timeDifference > 480000) {  
            return res.status(400).json({ message: 'Form submission time expired. Please reload the page.', errors: 'timestamp' });
        }

        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid timestamp.', error: error.message });
    }
};

module.exports = checkTimestampMiddleware;