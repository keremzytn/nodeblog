const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const {generateDate, limit, truncate} = require('./helpers/hbs');
const connectMongo = require('connect-mongo');
const expressSession = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/nodeblog_db', {
    
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
  
const app = express();

const MongoStore = require('connect-mongo');

app.use(expressSession({ 
    secret: 'gizli-anahtar',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Üretimde true yapın
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost/nodeblog_db' })
}));

const hostname = '127.0.0.1';
const port = 3000;

app.use(fileUpload());
app.use(express.static('public'));
app.use(methodOverride('_method'))

const hbs = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: { 
        generateDate: generateDate,
        limit: limit,
        truncate: truncate,
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Display Link Middleware

app.use((req,res,next)=>{
    const {userId} = req.session
    if(userId){
        res.locals={
            displayLink: true
        }
    }
    else{
        res.locals={
            displayLink: false
        }
    }
    next()
})

// Flash - Message Middleware
app.use((req, res, next)=>{
    res.locals.sessionFlash = req.session.sessionFlash
    delete req.session.sessionFlash
    next()
})

const main = require('./routes/main');
app.use('/', main);

const posts = require('./routes/posts');
app.use('/posts', posts);

const users = require('./routes/users');
app.use('/users', users);

const admin = require('./routes/admin/index')
app.use('/admin', admin)

app.listen(port, hostname, () => {
    console.log(`Server çalışıyor: http://${hostname}:${port}`);
});