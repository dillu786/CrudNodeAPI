const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');
const {validationResult, body}=require('express-validator');
const User=require('../models/user');


const DUMMY_USERS=[{
    id:uuidv4,
    name:"Dilshad",
    email:'azam.dilshad@gmail.com',
    password:'test@123'
}]

const getUsers= async (req,res,next)=>{

    let users;
    try{
        users=await User.find({},'-password');
    }
    catch(err)
    {
        const error=new HttpError('Could not get users',500)
        return next(error);
    }
     if(!users||users.length===0)
     {
        const error=new HttpError('No User found',401);
        return next(error);
     }
    res.json({users:users.map(user=>user.toObject({getters:true}))})
};
const signup= async (req,res,next)=>{
const errors=validationResult(req);
if(!errors.isEmpty())
{
    const error= new HttpError('Invalid inputs passed',422);
    return next(error);
}
    const {name,email,password}=req.body;
    let existingUser;
    try{
         existingUser=await User.findOne({email:email});
    }
    catch(err){
       const error=new HttpError('Signing up failed, please try again later',500);
      return next(error);
    }
   if(existingUser)
   {
    const error=new HttpError(
        'User already exist, please login instead',
        422
    );
    return next(error);
   }

    const createdUser=new User({
   
    name,
    email,
    image:'https://www.bing.com/ck/a?!&&p=4aaf3427cf2d6d0bJmltdHM9MTY5ODUzNzYwMCZpZ3VpZD0xYTBiOGI0NC0yZTdhLTYxNGUtMzY0Yy05OGNjMmE3YTZmMjUmaW5zaWQ9NTU5MA&ptn=3&ver=2&hsh=3&fclid=1a0b8b44-2e7a-614e-364c-98cc2a7a6f25&u=a1L2ltYWdlcy9zZWFyY2g_cT1zYW1wbGUgaW1hZ2UgdXJsJkZPUk09SVFGUkJBJmlkPUY4N0ZCNzk0MzcyNkM5OTY4NkQwMzdENDQ0NTRFRjYyQ0M1QjVGQ0M&ntb=1',
    password,
    places:[]
});

try{
    await createdUser.save();
}
catch(err){
    const error=new HttpError('User could not be created',500);
   return  next(error);
}

res.status(201).json({user:createdUser.toObject({getters:true})});
}


const login=async (req,res,next)=>{
    const {email,password}=req.body;
    let existingUser;
    try{
         existingUser=await User.findOne({email:email});
    }
    catch(err){
       const error=new HttpError('logging in failed, please try again later',500);
      return next(error);
    }
    if(!existingUser || existingUser.password!=password){
        const error=new HttpError('Invalid credentials could not log you in ',401);
       return  next(error);
    }
    
    res.json({message:'User logged In'})
};

exports.getUsers=getUsers;
exports.signup=signup;
exports.login=login;