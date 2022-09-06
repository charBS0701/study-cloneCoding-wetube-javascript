import express from "express";
import mogan from "morgan";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const PORT = 4000;

const app = express();
const logger = mogan("dev");

app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

app.use(logger);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} 👻`);

app.listen(PORT, handleListening);
