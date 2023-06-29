const express = require("express");
const router = express.Router();
const hashService = require("../../utils/hash/hashService");
const {
  registerUserValidation,
  loginUserValidation,
  idUserValidation,
} = require("../../validation/authValidationService");
const normalizeUser = require("../../model/usersService/helpers/normalizationUserService");
const usersServiceModel = require("../../model/usersService/usersService");
const { generateToken } = require("../../utils/token/tokenService");
const CustomError = require("../../utils/CustomError");
const authmw = require("../../middleware/authMiddleware");
const permissionsMiddlewareUser = require("../../middleware/permissionsMiddlewareUser");
//const { getGoogleAuthUrl, getGoogleUser } = require("./google-auth");

//סעיף 1
//register
//http://localhost:8181/api/auth/users
router.post("/users", async (req, res) => {
  try {
    await registerUserValidation(req.body);
    req.body.password = await hashService.generateHash(req.body.password);
    req.body = normalizeUser(req.body);
    await usersServiceModel.registerUser(req.body);
    res.json({ msg: "register" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// router.get("/auth/google", (req, res) => {
//   const authUrl = getGoogleAuthUrl();
//   res.redirect(authUrl);
// });

// router.get("/auth/google/callback", async (req, res) => {
//   const code = req.query.code;
//   const user = await getGoogleUser(code);
//   await usersServiceModel.registerUser(user);

//   // TODO: Handle user authentication and redirect to your app
// });

//סעיף 2
//http://localhost:8181/api/auth/users/login
router.post("/users/login", async (req, res) => {
  try {
    await loginUserValidation(req.body);
    const userData = await usersServiceModel.getUserByEmail(req.body.email);
    if (!userData) throw new CustomError("invalid email and/or password");
    const isPasswordMatch = await hashService.cmpHash(
      req.body.password,
      userData.password
    );
    let dateNow = Date.now();
    console.log("datenow", dateNow);
    console.log("blockeduntil", userData.blockedUntil);
    if (dateNow < userData.blockedUntil) {
      throw new CustomError("your password blocked for 24 hour");
    } else {
      if (!isPasswordMatch) {
        let timeStampsToUpdate = userData.timeStamps;
        console.log(timeStampsToUpdate);
        timeStampsToUpdate++;
        console.log(timeStampsToUpdate);
        userData.timeStamps = timeStampsToUpdate;
        console.log(userData.timeStamps);
        if (timeStampsToUpdate < 3) {
          userData.save();
          throw new CustomError("invalid email and/or password");
        } else {
          console.log("here");

          console.log(dateNow);
          const blockDuration = 24 * 60 * 60 * 1000;
          let blockedUntil = dateNow + blockDuration;
          userData.blockedUntil = blockedUntil;
          userData.timeStamps = 0;
          userData.save();
          throw new CustomError(
            "invalid password. You are blocked for 24 hours after 3 unsuccessful login attempts"
          );
        }
        //  userData.save();
      } else {
        const token = await generateToken({
          _id: userData._id,
          isAdmin: userData.isAdmin,
          isBusiness: userData.isBusiness,
        });
        res.json({ token });
      }
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

//סעיף 3
//get all users,admin
//http://localhost:8181/api/auth/users
router.get(
  "/users",
  authmw,
  permissionsMiddlewareUser(false, true, false),
  async (req, res) => {
    try {
      const userData = await usersServiceModel.getAllUsers();
      res.json(userData);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

//סעיף 4
//Get user,The registered user or admin
//http://localhost:8181/api/auth/users/:id
router.get(
  "/users/:id",
  authmw,
  permissionsMiddlewareUser(false, true, true),
  async (req, res) => {
    try {
      await idUserValidation(req.params.id);
      const userData = await usersServiceModel.getUserdById(req.params.id);

      res.json(userData);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

//סעיף 5
//Edit user
//http://localhost:8181/api/auth/users/:id
router.put(
  "/users/:id",
  authmw,
  permissionsMiddlewareUser(false, false, true),
  async (req, res) => {
    try {
      await idUserValidation(req.params.id);
      await registerUserValidation(req.body);
      req.body.password = await hashService.generateHash(req.body.password);
      req.body = normalizeUser(req.body);
      if (req.body.timeStamps) {
        throw new CustomError("you are not allowed to edit timeStamps");
      }
      if (req.body.password) {
        throw new CustomError("you are not allowed to edit password");
      }
      const userUpdate = await usersServiceModel.updateUser(
        req.params.id,
        req.body
      );
      res.json(userUpdate);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

//סעיף 6
//Edit is biz user
//http://localhost:8181/api/auth/users/:id
router.patch(
  "/users/:id",
  authmw,
  permissionsMiddlewareUser(false, false, true),
  async (req, res) => {
    try {
      await idUserValidation(req.params.id);
      const bizCardID = req.params.id;
      let userData = await usersServiceModel.getUserdById(bizCardID);
      if (userData.isBusiness === true) {
        userData.isBusiness = false;
        userData = await userData.save();
        res.json({ msg: "Editing was done false successfully" });
      } else {
        userData.isBusiness = true;
        userData = await userData.save();
        res.json({ msg: "Editing was done true successfully" });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

//סעיף 7
//delete
//http://localhost:8181/api/auth/users/:id
router.delete(
  "/users/:id",
  authmw,
  permissionsMiddlewareUser(false, true, true),
  async (req, res) => {
    try {
      // await registerUserValidation(req.body);
      // req.body.password = await hashService.generateHash(req.body.password);
      // req.body = normalizeUser(req.body);
      await idUserValidation(req.params.id);
      const deletedUser = await usersServiceModel.deleteUser(req.params.id);
      res.json(deletedUser);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

module.exports = router;
