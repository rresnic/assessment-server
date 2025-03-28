const {db} = require('../config/db.js'); 

const checkBlockedIP = async (req, res, next) => {
    const ip = req.ip; 

    try {
        const record = await db('blocked_ip')
            .where({ ip })
            .first();

        if (record) {
            const now = new Date();

            if (new Date(record.expiration_time) > now) {
                return res.status(403).send('Forbidden: IP is blocked');
            } else {
                // Remove expired block entry
                await db('blocked_ip')
                    .where({ ip })
                    .del();
            }
        }

        next(); // Proceed if not blocked or if expired entry was removed
    } catch (error) {
        console.error('Error checking blocked IPs:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = checkBlockedIP;