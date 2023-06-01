const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017', {
    dbName: 'Backend',
}).then(() => console.log('Database connected'))
    .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});
const user=mongoose.model('user',userSchema);

const users = [];
// app.get('/',(req,res)=>{
//     // res.sendStatus(500);

//     // res.json({
//     //     success:true,
//     //     products:[]
//     // });

//     // res.status(400).send('Maan meri jaan');

//     const pathlocation=path.resolve();
//     res.sendFile(path.join(pathlocation,'./index.html'));
//     // console.log(path.resolve())
//     console.log(path.join(pathlocation,'./index.html'));
// })

app.set('view engine', 'ejs');//Set view engine as ejs

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));//Gets data from post request
app.use(cookieParser());

// app.get('/', (req, res) => {
//     res.render('index', { name: 'Vraj Thakkar' });
// });
const isAuthenticated=async (req,res,next)=>{
    const {token}=req.cookies;
    if(token)
    {
        const decode=jwt.verify(token,'fghjk');
        req.yo=await user.findById(decode._id);
        next();
    }
    else
    {
        res.redirect('login');
    }
}
app.get('/',isAuthenticated, (req, res) => {
    console.log(req.yo);
    res.render('logout',{name:req.yo.email});
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/login',async (req,res)=>{
    const {email,password}=req.body;

    let yo= await user.findOne({email});
    if(!yo)
    {
        return res.redirect('/register');
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch)
    {
        return res.render('login',{message:'Incorrect Password'});
    }
    const token2 =jwt.sign({_id:yo._id},'fghjk');
    res.cookie('token',token2,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect('/');
})
app.post('/register',async (req,res)=>{
    // await message.create(req.body);
    const {email,password}=req.body;

    let yo= await user.findOne({email});
    if(yo)
    {
        // return console.log('hijkn');
        return res.redirect('/login');
    }
    const hashedPassword=await bcrypt.hash(password,10);
    yo=await user.create({
        email,
        password:hashedPassword,
    })
    const token2 =jwt.sign({_id:yo._id},'fghjk');
    res.cookie('token',token2,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect('/');
    // res.cookie('token','iamin',{
    //     // httpOnly:true,
    //     expires:new Date(Date.now()),
    // })
});
app.get('/logout',(req,res)=>{
    res.cookie('token',null,{
        httpOnly:true,
        expires: new Date(Date.now()),
    });
    res.redirect('/');
});
// app.get('/add', (req, res) => {
//     message.create({email:'vrajthakkar03@gmail.com',password:'123'}).then(()=>{
//         res.send('Watsapppp');
//     })
// });
// app.get('/add', async (req, res) => {
//     await message.create({email:'vrajthakkar03@gmail.com',password:'103'})
//         res.send('Watsapppp');
//     })
    
// app.get('/success', (req, res) => {
//     res.render('success');
// });
// app.post('/contact', async (req, res) => {
//     console.log(req.body);
//     // users.push({ email: req.body.email, password: req.body.password });
//     // res.render('Success');//or we can redirect to a new page
//     await message.create(req.body);
//     res.redirect('/success')
// });
// app.get('/users', (req, res) => {
//     res.json({
//         users,
//     })
// })
app.listen(3000, () => {
    console.log('Server is working');
})