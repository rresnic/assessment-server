const {db} = require('../config/db.js'); 

const userModel = {
    getByPhoneNumber: async (phoneNumber) => {
        try {
            return await db('users')
                .where({ phone_number: phoneNumber })
                .first();
        } catch (error) {
            console.error('Error retrieving user by phone number:', error);
            throw new Error('Error retrieving user.');
        }
    },

    createUser: async (fullName, username, phoneNumber, hashedPassword) => {
        try {
            const [newUser] = await db('users')
                .insert({
                    full_name: fullName,
                    username: username,
                    phone_number: phoneNumber,
                    password: hashedPassword
                })
                .returning('*'); 
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Error creating user.');
        }
    }
};

module.exports = userModel;