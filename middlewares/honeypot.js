const {db} = require("../config/db.js");

const honeypotMiddleware = async (req, res, next) => {
    if (req.body.honeypot && req.body.honeypot !== '') {
        const ip = req.ip || req.connection.remoteAddress;  // Get the IP address of the request

        const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);  

        try {
            await db('blocked_ip').insert({
                ip_address: ip,
                blocked_until: expirationTime
            });

            return res.status(403).json({
                message: 'Form submission failed, possible bot detected. Your IP has been blocked temporarily.',
                error: 'honeypot'
            });
        } catch (error) {
            console.error('Error inserting blocked IP:', error);
            return res.status(500).json({ message: 'Server error.', error: error.message });
        }
    }

    next();
};

module.exports = honeypotMiddleware;
