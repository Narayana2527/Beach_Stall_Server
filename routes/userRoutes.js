const express = require('express')
const router = express.Router();
const {userRegister,userLogin,getUserProfile,getProfile,resetPassword} = require("../controllers/userController")

router.post('/register',userRegister);
router.post('/login',userLogin);
router.post('/resetpassword',resetPassword);
router.get('/profile/:id',getUserProfile)
router.get('/profile',getProfile)


module.exports = router;