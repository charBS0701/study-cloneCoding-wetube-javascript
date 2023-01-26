const multer = require("multer");
export const localsMiddleware = (req, res, next) => {
  //console.log(req.session);
  /* if(req.session.loggendIn) {
    res.locals.loggedIn = true
  } */
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {}; // 로그인안돼있으면 빈 객체 할당
  console.log(req.session.user);
  next();
};

// 로그인 안 한 사람 돌려보내기
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

// 로그인 한 사람 돌려보내기
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

export const uploadFiles = multer({
  dest: "uploads/",
});
