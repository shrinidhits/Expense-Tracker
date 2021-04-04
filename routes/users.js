const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
// User model
const User = require('../models/User');

//Welcome page
router.get('/welcome',(req,res)=>res.render('../views/welcome'))
//Login page
router.get('/login',(req,res)=> res.render('login'))

//Register page
router.get('/register',(req,res)=> res.render('register'))

//View page
router.get('/viewDetails',(req,res)=>res.render('viewDetails',{user:req.user}))

//Chart page
router.get('/viewChart',(req,res)=>res.render('chart', {user:req.user}))

//Register handle
router.post('/register',(req,res)=>{
    const {name,email,password,password2}=req.body;
    let errors=[]
    if(!name || !email || !password || !password2){
        errors.push({msg:'Please fill in all fields'})
    }
    if(password!=password2){
        errors.push({msg: 'Passwords do not match'})
    }
    if(password.length<6)
    {
        errors.push({msg:'Password must be at least 6 characters'})
    }
    if(errors.length>0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        User.findOne({ email: email }).then(user => {
            if (user) {
              errors.push({ msg: 'Email already exists' });
              res.render('register', {
                errors,
                name,
                email,
                password,
                password2
              });
            } else {
              var balance=0
              var arr=[]
              const newUser = new User({
                name,
                email,
                password,
                balance,
                arr
              });
              bcrypt.genSalt(10,(err,salt)=>
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err) throw err;
                    //set password to hashed
                    newUser.password=hash;
                    newUser.save()
                    .then(user=>{
                        req.flash('success_msg','You are now registered and can login')
                        res.redirect('/users/login');
                    })
                    .catch(err=>console.log(err));
              }))
              
            }
        });
    }
})
//Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
//Logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');
})

//Add income
router.post('/addIncome',async (req,res)=>{
  const record = await User.findOne({ _id: req.user._id})
  var currBalance=record.balance
  record.balance = Number(currBalance)+Number(req.body.amount)
  await record.save()
  req.flash('success_msg','Income added');
  console.log("Adding income success")
  res.redirect('/dashboard')
})

//Add expense
router.post('/addExpense',async (req,res)=>{
  const record = await User.findOne({ _id: req.user._id})
  var exp = { reason: req.body.reason, amount: req.body.amount , date:req.body.date.toString()};
  record.balance-=Number(req.body.amount)
  record.expense.push(exp)
  await record.save()
  req.flash('success_msg','Expense added');
  console.log("Adding expense success")
  res.redirect('/dashboard')
})

//Edit expense
router.post('/editExpense',async (req,res)=>{
  const record = await User.findOne({ _id: req.user._id})
  var slNo = req.body.slNo-1
  if(slNo<record.expense.length)
  {
    var initialexpense = record.expense[slNo].amount
    record.expense[slNo].amount=req.body.amount
    record.expense[slNo].reason=req.body.reason
    record.expense[slNo].date=req.body.date.toString()
    if(initialexpense>=req.body.amount)
    {
      record.balance+=initialexpense-Number(req.body.amount)
    }
    else{
      record.balance-=Number(req.body.amount)-initialexpense
    }
    
    await record.save()
    req.flash('success_msg','Edited expense');
    console.log("Edit success")
  }
  else{
    req.flash('error_msg','Sl No. is invalid')
  }
  res.redirect('/dashboard')
})

//Delete expense
router.post('/deleteExpense',async (req,res)=>{
  var slNo = req.body.slNo-1
  const record = await User.findOne({ _id: req.user._id})
  if(slNo<record.expense.length)
  {
    record.balance+=Number(record.expense[slNo].amount)
    record.expense.pull({_id: record.expense[slNo]._id})
    await record.save()
    req.flash('success_msg','Deleted expense');
    console.log("Delete success")
  }
  else{
    req.flash('error_msg','Sl No. is invalid')
  }
  res.redirect('/dashboard')
})


module.exports= router;