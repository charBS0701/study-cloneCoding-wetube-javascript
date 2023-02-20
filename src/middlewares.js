const multer = require("multer");
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isHeroku = process.env.NODE_ENV === "production"; // NODE_ENV는 heroku에 정의돼있음

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "charbs-wetube",
  acl: "public-read",
  // bucket 안에 folder 속에 file 분류하기
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = "images/" + newFileName;
    ab_callback(null, fullPath);
  },
});
const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "charbs-wetube",
  acl: "public-read",
  // bucket 안에 folder 속에 file 분류하기
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = "videos/" + newFileName;
    ab_callback(null, fullPath);
  },
});

export const localsMiddleware = (req, res, next) => {
  //console.log(req.session);
  /* if(req.session.loggendIn) {
    res.locals.loggedIn = true
  } */
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {}; // 로그인안돼있으면 빈 객체 할당
  res.locals.isHeroku = isHeroku;
  // console.log(req.session.user);
  next();
};

// 로그인 안 한 사람 돌려보내기
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Log in first");
    return res.redirect("/login");
  }
};

// 로그인 한 사람 돌려보내기
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 3000000 },
  storage: isHeroku ? s3ImageUploader : undefined,
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 10000000 },
  storage: isHeroku ? s3VideoUploader : undefined,
});
