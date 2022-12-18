import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const userRegistration = async (req, res) => {
  const { name, email, password, password_confirmation, tc } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    return res.send({ status: "failed", message: "Email already exists!" });
  } else {
    if (name && email && password && password_confirmation && tc) {
      if (password === password_confirmation) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashPassword = await bcrypt.hash(password, salt);
          const doc = new User({
            name: name,
            email: email,
            password: hashPassword,
            tc: tc,
          });
          await doc.save();
          const saved_user = await User.findOne({ email: email });
          // generate jwt token
          const token = jwt.sign(
            { userID: saved_user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          return res
            .status(201)
            .send({
              status: "success",
              message: "Registration successful!",
              token: token,
            });
        } catch (err) {
          return res.send({ status: "failed", message: "Unable to register!" });
        }
      } else {
        return res.send({
          status: "failed",
          message: "Password & Confirm Password doesn't match!",
        });
      }
    } else {
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });
    }
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.findOne({ email: email });
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email === email && isMatch) {
          // generate jwt token
          const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          return res.send({
            status: "success",
            message: "Login successful!",
            token: token,
          });
        } else {
          return res.send({
            status: "failed",
            message: "Email or Password is not valid!",
          });
        }
      } else {
        return res.send({
          status: "failed",
          message: "You are not a registered user!",
        });
      }
    } else {
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });
    }
  } catch (err) {
    // console.log(err);
    return res.send({ status: "failed", message: "Unable to login!" });
  }
};

export const changeUserPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;
  if (password && password_confirmation) {
    if (password !== password_confirmation) {
      return res.send({
        status: "failed",
        message: "New Password & New Confirm Password doesn't match!",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(req.user._id, {
        $set: { password: newHashPassword },
      });
      return res.send({
        status: "success",
        message: "Password changed succesfully!",
      });
    }
  } else {
    return res.send({ status: "failed", message: "All fields are required!" });
  }
};

export const loggedUser = async (req, res) => {
  res.send({ user: req.user });
};

export const sendUserPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const user = await User.findOne({ email: email });
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`; // /api/user/reset/:id/:token (in frontend)
      // console.log(link)
      const msg = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Link",
        html: `<div><h2>Click on the link below to reset your password.</h2><div><div>${link}</div><br/><div>This link is valid for 15 minutes only.</div>`,
      };
      nodemailer
        .createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          port: process.env.EMAIL_PORT,
          host: process.env.EMAIL_HOST,
        })
        .sendMail(msg, (err) => {
          if (err) {
            // console.log(err)
            return res.send(
              "Error occured while sending you an Email. Please try again later!"
            );
          } else {
            // console.log("Email sent!");
            return res.send(
              "Email with Password Reset Link sent successfully! Please check your Email!"
            );
          }
        });
    } else {
      return res.send({ status: "failed", message: "Email doesn't exist!" });
    }
  } else {
    return res.send({ status: "failed", message: "Email field is required!" });
  }
};

export const userPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;
  const user = await User.findById(id);
  const new_secret = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        return res.send({
          status: "failed",
          message: "Password & Confirm Password doesn't match!",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(user._id, {
          $set: { password: newHashPassword },
        });
        return res.send({
          status: "success",
          message: "Password reset successfully!",
        });
      }
    } else {
      return res.send({
        status: "failed",
        message: "All fields are required!",
      });
    }
  } catch (err) {
    // console.log(err);
    return res.send({ status: "failed", message: "Invalid token!" });
  }
};
