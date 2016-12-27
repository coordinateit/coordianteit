module.exports = {
  userAuth: function(req, res, next) {
    if (!req.session.id) {
      res.redirect('/');
    } else {
      next();
    }
  },

  adminAuth: function(req, res, next) {
    if (!req.session.isadmin) {
      console.log("not an admin");
      res.redirect('/');
    } else {
      next();
    }
  }
}
