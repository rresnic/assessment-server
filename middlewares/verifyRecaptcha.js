const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
const SECRET_KEY = process.env.GOOGLE_SECRET; // Secret key for reCAPTCHA

const verifyRecaptcha = async (req, res, next) => {
    const { captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({ success: false, message: 'reCAPTCHA token missing' });
    }

    try {
        const recaptchaRes = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            `secret=${SECRET_KEY}&response=${captchaToken}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const recaptchaData = recaptchaRes.data; 

        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
        }

        next(); 

    } catch (error) {
        return res.status(500).json({ success: false, message: 'reCAPTCHA validation error' });
    }
};

module.exports = verifyRecaptcha;