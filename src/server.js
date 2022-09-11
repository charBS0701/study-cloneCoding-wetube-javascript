import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
var uuid = require("short-uuid");
const PORT = 4000;

const app = express();
const logger = morgan("common");

morgan.token("id", function getId(req) {
  return req.id;
});

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(assignId);
app.use(morgan(":id :method :url :response-time"));

function assignId(req, res, next) {
  req.id = uuid();
  next();
}

// setup the logger
// app.use(logger);
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 👻`);

app.listen(PORT, handleListening);
