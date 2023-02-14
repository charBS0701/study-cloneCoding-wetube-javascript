import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
// setup the logger
// app.use(logger);
app.use(express.urlencoded({ extended: true })); // 서버가 form으로 오는 data를 이해하도록
app.use(express.json()); //string을 JS object로 바꿔줌, headers: { "Content-type": "application/json" }인 request만 express.json()을 실행

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false, // 수정되지 않은 세션 저장 false
    store: MongoStore.create({
      // 서버의 메모리가 아닌 mongodb에 세션저장
      mongoUrl: process.env.DB_URL,
    }),
  })
);
app.use(flash());
app.use((req, res, next) => {
  // solving record video mp4 transcode error
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
