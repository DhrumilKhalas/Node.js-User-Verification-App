import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

var checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      // get token from header
      token = authorization.split(" ")[1];

      // verify token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // userID same as useLogin and userRegistration controller
      // console.log(userID);

      // get user from token
      req.user = await User.findById(userID).select("-password");
      // console.log(req.user)
      // console.log(req.user._id);

      next();
    } catch (err) {
      // console.log(err)
      return res
        .status(401)
        .send({ status: "false", message: "Unauthorized user!" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .send({
        status: "false",
        message: "Unauthorized user, Token is not available!",
      });
  }
};

export default checkUserAuth;
