 const {validationResult,body}=require('express-validator');
 const HttpError=require('../models/http-error');
 const Place =require('../models/place');
 const User=require('../models/user');
const mongoose =require('mongoose');


 const getPlaceById=async(req,res,next)=>{
    let placeId=req.params.pid;

    let place;
  try
    {
    place= await Place.findById(placeId);

     }
     catch(err)
     {
     const error=new HttpError("Something went wrong",500);
     next(error);
     }
     if(!place)
     {
        const error=new HttpError('Invalid placeID entered',404);
        next(error);
     }
     res.status(201).json({place:place.toObject({getters:true})});

 }

 const getPlacesByUserId=async (req,res,next)=>{
    const userId=req.params.uid;
    
    //let places;
    let userWithPlaces;
    try{
       // place=Place.find(a=>a.creator==userId)
      // places= await Place.find({creator:userId});
     userWithPlaces=await User.findById(userId).populate('places');

    }
    catch(err){
        const error=new HttpError('Something went wrong',500);
        next(error);
    }

    if(!userWithPlaces|| userWithPlaces.length==0)
    {
        const error =new HttpError('No places could be found with the userId');
        next(error);
    }
    res.status(402).json({places:userWithPlaces.places.map(place=>place.toObject({getters:true}))});
 }


 const createPlace=async(req,res,next)=>{
    const error=validationResult(req.body);
    if(!error.isEmpty()|| error.length>0)
    return next(
    new HttpError('Invalid input entered',422)
    );


const{title,description,address,location,creator}=req.body;
const createdPlace=new Place({
    title,
    description,
    address,
    location,
    image:"https://www.google.com/imgres?imgurl=https%3A%2F%2Fasia.omsystem.com%2Fcontent%2F000107506.jpg&tbnid=NZ6unGWQe6yEPM&vet=12ahUKEwiq0NH6u5qCAxXq2zgGHd_KBGwQMygAegQIARBU..i&imgrefurl=https%3A%2F%2Fasia.omsystem.com%2Fproduct%2Fdslr%2Fem1mk3%2Fsample.html&docid=zNjke2VAlovaaM&w=5184&h=3888&q=sample%20images&ved=2ahUKEwiq0NH6u5qCAxXq2zgGHd_KBGwQMygAegQIARBU",
    creator


});


let user;
try{
user=await User.findById(creator);
console.log("line no 77"+user);
}
catch(err)
{
    const error=new HttpError('Creating place failed,please try again');
    return next(error);
}

if(!user)
{
    const error=new HttpError('Could not find user for provided id',404);
    return next(error);
}

try{

    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);
   await user.save({session:sess});
   await sess.commitTransaction();
}
catch(err)
{
    console.log(err);
 const error=new HttpError('Could not create a place',500);
 return next(error);
}

res.status(201).json({place:createdPlace.toObject({getters:true})});
}

const updatePlace= async (req,res,next)=>{
const errors=validationResult(req);
if(!errors.isEmpty()){
    const error=new HttpError('Invalid inputs entered',422);
    next(error);

}

const {title,description}=req.body;
const placeid=req.params.pid;
let place;
try
{
    place= await Place.findById(placeid);
}
catch(err)
{
const error=new HttpError('Something went wrong',500);
next(error);    
}

if(!place)
{
    const error=new HttpError('Entered Place Id not founf',404);
}

place.title=title;
place.description=description;

try{
   await place.save();
}
catch(err)
{
    const error= HttpError(' Data Could not be updated',500);
    next(error);

}

res.status(200).json({place:place.toObject({getters:true})});


}
 

const deletePlace=async (req,res,next)=>{
    const placeid=req.params.pid;
    let place;
try{
     place=await Place.findById(placeid).populate('creator');
     console.log("place found or not"+place);
}
catch(err)
{
    const error=new HttpError("Something went wrong",500);
    next(error);
}
if(!place)
{
    const error=new HttpError("No such Place id found",404);
    next(error);
}
try
{
    const sess=await mongoose.startSession();
    sess.startTransaction();
    place.deleteOne({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction();
 
}
catch(err)
{
    const error=new HttpError('Something went wrong, place could not be deleted',500);
    next(error);
}

res.status(200).json({message:'deleted Place'});
   
}

exports.getPlaceById=getPlaceById;
exports.getPlacesByUserId=getPlacesByUserId;
exports.createPlace=createPlace;
exports.deletePlace=deletePlace;
exports.updatePlace=updatePlace; 