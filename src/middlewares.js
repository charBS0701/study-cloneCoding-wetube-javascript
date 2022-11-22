const multer = require("multer");
export const localsMiddleware = (req, res, next) => {
  //console.log(req.session);
  /* if(req.session.loggendIn) {
    res.locals.loggedIn = true
  } */
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  //console.log(res.locals);
  next();
};

export const uploadFiles = multer({
  dest: "uploads/",
});
