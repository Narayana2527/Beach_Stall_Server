const express = require('express')
const router = express.Router();
const {userRegister,userLogin,getUserProfile,getProfile} = require("../controllers/userController")

router.post('/register',userRegister);
router.post('/login',userLogin);
router.get('/profile/:id',getUserProfile)
router.get('/profile',getProfile)


module.exports = router;