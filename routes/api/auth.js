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
const { logErrorToFile } = require("../../utils/fileLogger");

//סעיף 1
//register
//http://localhost:8181/api/auth/users
router.post("/users", async (req, res) => {
  try {
    await registerUserValidation(req.body);
    req.body.password = await hashService.generateHash(req.body.password);
    req.body = normalizeUser(req.body);
    await usersServiceModel.registerUser(req.body);
    res.json({ msg: "register success" });
  } catch (err) {
    logErrorToFile(err, 400);
    res.status(400).json(err);
  }
});

//סעיף 2
//http://localhost:8181/api/auth/users/login
router.post("/users/login", async (req, res) => {
  let num = 401;
  try {
    await loginUserValidation(req.body);
    const userData = await usersServiceModel.getUserByEmail(req.body.email);
    if (!userData) throw new CustomError("User does not exists");

    const isPasswordMatch = await hashService.cmpHash(
      req.body.password,
      userData.password
    );
    let dateNow = Date.now();
    const blockDuration = 24 * 60 * 60 * 1000;
    if (dateNow < userData.blockedUntil) {
      throw new CustomError("your password blocked for 24 hour");
    } else {
      if (!isPasswordMatch) {
        let timeStampsToUpdate = userData.timeStamps;
        timeStampsToUpdate++;
        userData.timeStamps = timeStampsToUpdate;
        if (timeStampsToUpdate < 3) {
          userData.save();
          throw new CustomError("invalid email and/or password");
        } else {
          let blockedUntil = dateNow + blockDuration;
          userData.blockedUntil = blockedUntil;
          userData.timeStamps = 0;
          throw new CustomError(
            "invalid password. You are blocked for 24 hours after 3 unsuccessful login attempts"
          );
        }
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
    if (err instanceof CustomError) logErrorToFile(err.msg, num);
    else logErrorToFile(err, num);
    res.status(num).json(err);
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
      logErrorToFile(err, 500);
      res.status(500).json(err);
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
      if (!userData) {
        throw new CustomError("user does not exist");
      }
      res.json(userData);
    } catch (err) {
      if (err instanceof CustomError) logErrorToFile(err.msg, 400);
      else logErrorToFile(err, 400);
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
    let num = 400;
    try {
      id = await idUserValidation(req.params.id);
      registered = await registerUserValidation(req.body);
      num = 500;
      req.body.password = await hashService.generateHash(req.body.password);
      if (req.body.password) num = 400;
      req.body = normalizeUser(req.body);
      if (req.body.timeStamps || req.body.blockedUntil) {
        num = 403;
        throw new CustomError(
          "you are not allowed to edit timeStamps or blockedUntil"
        );
      }
      num = 500;
      const userUpdate = await usersServiceModel.updateUser(
        req.params.id,
        req.body
      );
      res.json(userUpdate);
    } catch (err) {
      if (err instanceof CustomError) logErrorToFile(err.msg, num);
      else logErrorToFile(err, num);
      res.status(num).json(err);
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
        res.status(200).json({ msg: "Editing was done false successfully" });
      } else {
        userData.isBusiness = true;
        userData = await userData.save();
        res.status(200).json({ msg: "Editing was done true successfully" });
      }
    } catch (err) {
      logErrorToFile(err, 400);
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
      await idUserValidation(req.params.id);
      const userToDelete = await usersServiceModel.getUserdById(req.params.id);
      const deletedUser = await usersServiceModel.deleteUser(req.params.id);
      res.json(deletedUser);
    } catch (err) {
      let num = 400;
      if (userToDelete && deletedUser === null) num = 500;
      logErrorToFile(err, num);
      res.status(num).json(err);
    }
  }
);

module.exports = router;
