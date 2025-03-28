const {db} = require('../config/db.js'); // Assuming you've set up Knex in db.js
const verifyRecaptcha = require('./verifyRecaptcha.js');

const checkProbationIP = async (req, res, next) => {
    const ip = req.ip; // Get the IP of the request

    try {
        const record = await db('probation_ips')
            .where({ ip })
            .first();

        if (record) {
            const lastAttempt = new Date(record.last_attempt);
            const now = new Date();
            const timeDifference = (now - lastAttempt) / (1000 * 60 * 60); // Difference in hours

            if (timeDifference > 24) {
                // Reset error attempts to 0 if the last error was over 24 hours ago
                await db('probation_ips')
                    .where({ ip })
                    .update({
                        error_attempts: 0, // Reset attempts after 24 hours
                        last_attempt: now
                    });
            } else if (record.error_attempts >= 3) {
                // If there are 3 or more error attempts, check for reCAPTCHA in the request body
                if (!req.body.recaptchaToken) {
                    return res.status(400).json({
                        message: 'reCAPTCHA is required after multiple failed attempts.',
                        recaptchaRequired: true
                    });
                } else {
                    return verifyRecaptcha(req, res, next);
                }
            }
        }

        next(); 
    } catch (error) {
        console.error('Error checking probation IPs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = checkProbationIP;
