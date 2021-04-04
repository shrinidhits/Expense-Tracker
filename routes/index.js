const express = require('express')
const router = express.Router()
const {ensureAuthenticated}=require('../config/auth');

//welcome
router.get('/',(req,res)=> res.render('welcome'))

//dashboard
router.get('/dashboard',ensureAuthenticated,(req,res)=> res.render('dashboard',{
    user:req.user
}))

module.exports= router;