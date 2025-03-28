const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userController = require('../controllers/userController');
const honeypot = require('../middlewares/honeypot');
const checkProbation = require('../middlewares/checkProbationIP');
const checkTimestampMiddleware = require('../middlewares/checkTimeStamp');
const {db} = require('../config/db.js');

const generateTimeToken = () => Date.now();

router.post('/login', honeypot, checkProbation, checkTimestampMiddleware, userController.login);

router.post('/register', honeypot, checkProbation, checkTimestampMiddleware, userController.createUser);


router.get('/set-timestamp', (req, res) => {
    const timestamp = Date.now(); 
    const token = jwt.sign({ timestamp: timestamp }, process.env.JWT_SECRET, { expiresIn: '8m' });
    res.json({ message: 'Timestamp set.', token: token });
});

router.get('/form-setup', async (req, res) => {
    try {
      const clientIp = req.ip; // Get user's IP
        const result = await db('probation_ips')
        .select('error_attempts')
        .where({ ip: clientIp })
        .first(); 

      const requiresRecaptcha = result?.error_attempts >= 3; 
  
      const timeStamp = generateTimeToken(); 
      const timeToken = jwt.sign({timeStamp: timeStamp}, process.env.JWT_SECRET, { expiresIn: '8m'});
  
      res.status(200).json({ recaptchaRequired: requiresRecaptcha, timeToken });
    } catch (error) {
      console.error('Error checking reCAPTCHA requirement:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;