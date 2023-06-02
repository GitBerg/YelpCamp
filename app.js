if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const serverless = require('serverless-http')
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

const session = require('express-session');
const MongoStore = require('connect-mongo');



const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl).then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Serving on port ${port}!`);
    })
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "conection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600
})

store.on('error', function (e){
    console.log("SESSION STORE ERROR!", e);
})

const sessionConfig = { 
    store,
    secret,
    resave: false, 
    saveUninitialized: true, 
    cookie: { 
        httpOnly: true ,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.returnTo = req.originalUrl;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh Não, Algo está errado!'
    res.status(statusCode).render('error', { err });
})



module.exports.handler = serverless(app);
