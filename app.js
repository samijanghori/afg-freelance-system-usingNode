const express = require('express')
const app = express()
const mongoose = require('mongoose');
//
const dbURI = 'mongodb+srv://mrsami:Admin123@cluster0.9dniolf.mongodb.net/AfgFreelance-database';
mongoose.connect(dbURI)
    .then((result) => console.log('connected to DB'))
    .catch((err) => console.log(err))


const morgan = require('morgan')
   
//register view engine
app.set('view engine','ejs');

app.use(morgan('dev'))
app.use(express.static('public'))

app.get('/',(req,res) => {
    const members = [
    {
        id: 1,
        name: 'Ahmad Shah Rahmani',
        profession: 'Web Developer',
        experience: 5,
        location: 'Kabul',
        status: 'Available'
    },
    {
        id: 2,
        name: 'Maryam Hosseini',
        profession: 'Graphic Designer',
        experience: 4,
        location: 'Herat',
        status: 'Available'
    },
    {
        id: 3,
        name: 'Rahman Noori',
        profession: 'Content Writer',
        experience: 3,
        location: 'Mazar-i-Sharif',
        status: 'Available'
    },
    {
        id: 4,
        name: 'Fatema Ahmadi',
        profession: 'Digital Marketer',
        experience: 6,
        location: 'Kandahar',
        status: 'Available'
    },
    {
        id: 5,
        name: 'Hamed Rezaei',
        profession: 'Video Editor',
        experience: 4,
        location: 'Balkh',
        status: 'Available'
    },
    {
        id: 6,
        name: 'Nasim Karimi',
        profession: 'Translator',
        experience: 7,
        location: 'Nangarhar',
        status: 'Available'
    }
];
    res.render('index',{title : 'HomePage'   ,         members: members  
});
})
app.get('/about',(req,res)=>{
    res.render('about',{title : 'OurTeam'});
})
app.get('/create/member',(req,res) => {
    res.render('create_member',{title : 'createMember'})
})
app.listen(3000,() =>{
    console.log('running on port 3000')
})