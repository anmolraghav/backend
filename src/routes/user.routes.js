import { Router } from "express";
import {registerUser,loginUser, logoutUser,refreshAccessToken,
     changeCurrentPassword, getCurrentUser, updateAccountDetails,
      updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory}
       from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const UserRouter = Router();

UserRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
]),
registerUser
)

UserRouter.route("/login").post(loginUser)

//secured routes
UserRouter.route("/logout").post(verifyJWT,logoutUser)
UserRouter.route("/refresh-token").post(refreshAccessToken)
UserRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)
UserRouter.route("/current-user").get(verifyJWT,getCurrentUser)
UserRouter.route("/update-account").patch(verifyJWT,updateAccountDetails)
UserRouter.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
UserRouter.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUsercoverImage)
UserRouter.route("/c/:username").get(verifyJWT,getUserChannelProfile)
UserRouter.route("/history").get(verifyJWT,getWatchHistory)

 
export default UserRouter