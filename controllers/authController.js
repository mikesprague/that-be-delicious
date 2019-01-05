const mongoose = require('mongoose');
const passport = require('passport');
const crypto = require('crypto');
const { promisify } = require('es6-promisify');
const mail = require('../handlers/mail');

const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login, please try again',
  successRedirect: '/',
  successFlash: 'You have been successfully logged in 🎉',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'You must be logged in to do that ⛔');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // see if the user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account found 🤷');
    return res.redirect('/login');
  }
  // set reset tokens and expiration on the user's account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  // send an email to user with reset token and instructions
  const urlPrefix = req.headers.host.startsWith('localhost') ? 'http://' : 'https://';
  const resetUrl = `${urlPrefix}${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  mail.send({
    user,
    subject: 'Password Reset',
    resetUrl,
    filename: 'passwordReset',
  });

  req.flash('success', 'You have been emailed a password reset link 🔗');
  // redirect to login page
  return res.redirect('/login');
};

exports.reset = async (req, res) => {
  // see if token exists
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired 😕');
    return res.redirect('/login');
  }
  // show reset password form
  return res.render('reset', { title: 'Reset Your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body.passwordConfirm) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match 👎');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired 🤷');
    return res.redirect('/login');
  }
  const setPassword = promisify(user.setPassword.bind(user));
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updateUser = await user.save();
  await req.login(updateUser);
  req.flash('success', 'Your password has been successfully reset and you are now logged in 🕺');
  return res.redirect('/');
};
