const userModel = require('../models/userModel.js'); 
const jwt = require('jsonwebtoken');
const regex = {
    fullName: /^[^'"`;`]+$/,  // Prevent SQL injection characters like ', ", ;, `
    username: /^[a-zA-Z]+$/,  // Only letters for the username
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,  // At least 8 characters, with at least 1 letter and 1 number
    phoneNumber: /^05\d{8}$/  // Matches phone numbers like 0512345678
};

const userController = {
    getUserByPhone: async (req, res) => {
        const { phoneNumber } = req.body; 
        if(!regex.phoneNumber.test(phoneNumber)){
            return res.status(400).send({message: "Invalid phone number", errors:"phone"})
        }
        try {
            const user = await userModel.getByPhoneNumber(phoneNumber);

            if (user) {
                return res.status(200).json(user); 
            } else {
                return res.status(404).json({ message: 'User not found.' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Server error.', error: error.message });
        }
    },

    createUser: async (req, res) => {
        const { fullname, username, phone, password } = req.body;


        if (!fullname || !username || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (!regex.fullName.test(fullname)) {
            return res.status(400).json({ message: 'Full name contains invalid characters.', errors: "name" });
        }

        if (!regex.username.test(username)) {
            return res.status(400).json({ message: 'Username can only contain letters.', errors: "username" });
        }

        if (!regex.password.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long, containing at least one letter and one number.', errors:"password" });
        }

        // Phone Number Validation (Matches format 05XXXXXXXX)
        if (!regex.phoneNumber.test(phone)) {
            return res.status(400).json({ message: 'Phone number must match the format 05XXXXXXXX.', errors: "phone" });
        }

        try {
            const hashedPassword = hashPassword(password); 

            const newUser = await userModel.createUser(fullname, username, phone, hashedPassword);

            return res.status(201).json({
                message: 'User created successfully.',
                user: newUser
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating user.', error: error.message });
        }
    },
    login: async(req, res) => {
        const {phone} = req.body;
        if(!regex.phoneNumber.test(phone)){
            return res.status(400).send({message: "Invalid phone number", errors:"phone"})
        }
        try {
            const user = await userModel.getByPhoneNumber(phone);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Compare the entered password with the stored hashed password once we implement password
            // const isMatch = await bcrypt.compare(password, user.password);
            // if (!isMatch) {
            //     return res.status(401).json({ message: 'Invalid password.' });
            // }

            // Create the access token (expires in 1 hour)
            const accessToken = jwt.sign(
                { id: user.id, phone: user.phone_number },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // reduce when we switch to refresh
            );

            // Create the refresh token (expires in 30 days) once we implement that
            // const refreshToken = jwt.sign(
            //     { id: user.id, phoneNumber: user.phone_number },
            //     process.env.JWT_SECRET,
            //     { expiresIn: '30d' }
            // );

            // once we implement refresh
            // userModel.saveRefreshToken(user.id, refreshToken);

            // Send back the tokens
            res.status(200).json({
                message: 'Login successful.',
                accessToken: accessToken,
            });
        } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message });
        }
    }
};

const bcrypt = require('bcrypt');
const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
};

module.exports = userController;
