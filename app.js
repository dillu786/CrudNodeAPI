// const fs = require('fs');

// const userName = 'Max';

// fs.writeFile('user-data.txt', 'Name: ' + userName, (err) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log('WROTE FILE');
// });


// const http=require('http');
// const server=http.createServer((req,res)=>{
//   console.log('INCOMING REQUEST');
//   console.log(req.method,req.url);

// if(req.method==='POST'){
//   let body='';
//   req.on('end',()=>{
// const userName=body.split('=')[1];
// res.end('<h1>'+userName+'</h1>')
//   })
//   req.on('data',(chunk)=>{
//     body+=chunk;
//   })
  
//   }

// else{

//   res.setHeader('Content-Type','text/html');

//   res.end("<form method='POST'><input type='text' name='username'><button type='submit'>Create User</button></form>");
// }
// });

// server.listen(5000);

// const express=require('express');
// const app=express();
// app.use((req,res,next)=>{
//  let body='';
//  req.on('end',()=>{
//   const userName=body.split("=")[1];
//   if(userName)
//   {
//     req.body={name:userName}
//   }
//   next();
//  })
//  req.on('data',chunk=>{
//   body+=chunk
//  });
  
// });
// app.use((req,res,next)=>{
//   if(req.body)
//   {
//     return res.send('<h1>User:'+req.body.name+'</h1>')
//   }
//   res.send('<form method="POST"><input type="text" name="username"></input><button type="submit">Create User</button>')
// })
// app.listen(5000);

const express =require('express');
const bodyParser=require('body-parser');

const HttpError=require('./models/http-error');
const placesRoutes=require('./routes/places-routes');
const usersRoutes=require('./routes/users-routes');
const { default: mongoose } = require('mongoose');
const app=express();
app.use(bodyParser.json());
app.use('/api/places',placesRoutes);
app.use('/api/users',usersRoutes);
app.use((req,res,next)=>{
 const error=new HttpError('Could not find this route',404);
 throw error;
});
app.use((error,req,res,next)=>{
  if(res.headerSent)
  {
    return next(error);
  }
  res.status(error.code || 500 )
  res.json({message:error.message || 'An unknown error occurred'});
})

mongoose.connect('mongodb+srv://dilshadau:faizan@cluster0.nlem5op.mongodb.net/places?retryWrites=true&w=majority')
.then(()=>{
  app.listen(5000);
}).catch((error)=>
{
console.log(error);
})
