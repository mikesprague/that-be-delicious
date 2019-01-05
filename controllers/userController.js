const mongoose = require('mongoose');
const { promisify } = require('es6-promisify');

const User = mongoose.model('User');

exports.loginForm = (req, res) => {
  res.render('login', {
    title: 'Login',
  });
};

exports.registerForm = (req, res) => {
  res.render('register', {
    title: 'Register',
  });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email', 'You must supply a valid email').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'Password can not be blank').notEmpty();
  req.checkBody('passwordConfirm', 'Confirmed password can not be blank').notEmpty();
  req.checkBody('passwordConfirm', 'Your passwords do not match').equals(req.body.password);
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  req.checkBody('email', 'You must supply a valid email').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.sanitizeBody('password');
  req.checkBody('password', 'You must supply your password').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('login', {
      title: 'Login',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next();
};

exports.validateEmail = (req, res, next) => {
  req.checkBody('email', 'You must supply a valid email').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('login', {
      title: 'Login',
      body: req.body,
      flashes: req.flash(),
    });
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
  });
  // User.register - register is bound to User via passport-local-mongoose library - version in use here uses callbacks so we promisify it to make use of async/await
  const register = promisify(User.register.bind(User)); // if registering to an object, you must also pass the object so it knows what to bind to
  await register(user, req.body.password);
  next(); // move on to authController.login
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  // findOneAndUpdate takes in a query, the updates to perform, and options
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' },
  ).exec();

  req.flash('success', 'Your account has been updated 🙌');
  res.redirect('/account');
};
