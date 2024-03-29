
const express=require('express');
const usersController=require('../controller/users-controller');
const { check } = require('express-validator');
const router=express.Router();

router.get('/',usersController.getUsers);



router.post('/signup',[
    check('name')
    .not()
    .isEmpty(),
     check('email')
     .normalizeEmail() //Test@test.com => test@test.com
     .isEmail(),
     check('password').isLength({min:6})
],usersController.signup);
router.post('/login',usersController.login);
    
//router.patch('/:pid',usersController.updateUser);
//router.delete('/:pid',placesController.deletePlace);

module.exports=router;