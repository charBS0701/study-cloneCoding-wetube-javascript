import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password != password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  // 이미 존재하는 username이거나 email인 경우
  const exists = await User.exists({
    $or: [{ username: username }, { email }],
  });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const remove = (req, res) => res.send("Remove User");
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  // 토큰 획득
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  // 토큰 획득 시
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    // 토큰을 이용해 깃허브 api요청
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    // 받은 github에서 이메일찾기
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    // db에 일치하는 email 찾기
    let user = await User.findOne({ email: emailObj.email });
    // db에 일지하는 email 없으면 socialOnly로 추가
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    // 세션 추가
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.user = null;
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
// Edit profile
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, username: sessionUsername, email: sessionEmail, avatarUrl },
    },
    file,
    body: { name, email, username, location },
  } = req; // const id = req.session.user.id 와 동일
  // const { name, email, username, location } = req.body; 도 함께 넣을 수 있음

  // 바꾼 username 또는 email이 db에 존재 할 경우 못바꾸게 해야함
  // useername을 바꾼 경우
  if (username != sessionUsername) {
    if (await User.exists({ username })) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Error",
        errorMessage: "This username is already taken.",
      });
    }
  } else if (email != sessionEmail) {
    // email을 바꾼 경우
    if (await User.exists({ email })) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Error",
        errorMessage: "This email is already taken.",
      });
    }
  }

  // UPDATA DB User
  // await User.findByIdAndUpdate(_id, {
  //   name,
  //   email,
  //   username,
  //   location,
  // });
  //// UPDATAE session
  // 방법 1 : User 업데이트, session 따로 업데이트
  // req.session.user = {
  //   ...req.session.user,
  //   name,
  //   email,
  //   username,
  //   location,
  // };
  // return res.redirect("/users/edit");
  // 방법 2
  const isHeroku = process.env.NODE_ENV === "production";
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true } // findByIdAndUpdate가 바뀐 객체를 반환
  );
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly == true) {
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password); // 기존비밀번호 확인
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    // 새 비밀번호와 비밀번호 확인이 일치하지 않으면
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the comfirmation",
    });
  }
  user.password = newPassword; // 비밀번호 변경
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
