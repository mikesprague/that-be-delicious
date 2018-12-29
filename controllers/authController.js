const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login, please try again',
  successRedirect: '/',
  successFlash: 'You have been successfully logged in',
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
  req.flash('error', '🛑 You must be logged in to do that!');
  res.redirect('/login');
};
