module.exports = {
  userAuth: function(req, res, next) {
    if (!req.session.id) {
      res.redirect('/');
    } else {
      next();
    }
  }
}
