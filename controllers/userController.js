const mongoose = require('mongoose');
const { promisify } = require('es6-promisify');
const {
  body,
  sanitizeBody,
  validationResult,
} = require('express-validator');

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
  sanitizeBody('name');
  body('name', 'You must supply a name').not().isEmpty();
  body('email', 'You must supply a valid email').isEmail();
  sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  body('password', 'Password can not be blank').not().isEmpty();
  body('passwordConfirm', 'Confirmed password can not be blank').not().isEmpty();
  body('passwordConfirm', 'Your passwords do not match').equals(req.body.password);
  const errors = validationResult(req);
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
  body('email', 'You must supply a valid email').isEmail();
  sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  sanitizeBody('password');
  body('password', 'You must supply your password').not().isEmpty();
  const errors = validationResult(req);
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
  body('email', 'You must supply a valid email').isEmail();
  sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  const errors = validationResult(req);
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
