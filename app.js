const express = require('express');
const cors = require('cors');
const checkBlockedIP = require('./middlewares/checkBlocked');
const userRouter = require('./routes/userRouter.js');
const app = express();

app.use(express.json());

app.use(cors())
app.use(checkBlockedIP)
app.use('/userapi', userRouter);
const PORT = 3002;
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
});