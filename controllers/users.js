const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.userRegister = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ username, email, password });
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp-Camp!')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    if(!req.user){
        res.render('users/login');
    }else{
        req.flash("error","You Already Logged!");
        res.redirect('/campgrounds');
    }
}

module.exports.userLogin = (req, res) => {
    req.flash('success', `Welcome Back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res) => {
    req.logout()
    req.flash('success', 'GoodBye!')
    res.redirect('/login')
}
