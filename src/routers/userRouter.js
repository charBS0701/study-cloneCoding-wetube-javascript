import express from "express";
import {
  edit,
  remove,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
} from "../controllers/userControllers";

import { uploadFiles } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter
  .route("/edit")
  .get(getEdit)
  .post(uploadFiles.single("avatar"), postEdit);
userRouter.get("/remove", remove);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get(":id", see);

export default userRouter;
