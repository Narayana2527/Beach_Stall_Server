const express = require('express')
const router = express.Router();
const {userRegister,userLogin,getUserProfile,getProfile,resetPassword,forgotPassword,userLogout} = require("../controllers/userController")

router.post('/register',userRegister);
router.post('/login',userLogin);
router.post('/logout',userLogout);
router.post('/resetpassword/:token', resetPassword);
router.post('/forgotpassword', forgotPassword);
router.get('/profile/:id',getUserProfile)
router.get('/profile',getProfile)


module.exports = router;