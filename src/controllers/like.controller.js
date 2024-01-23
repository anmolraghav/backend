import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id
    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid video Id")
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new apiError(401,"Video not found")
    }
    const likedVideo = await Like.findOne({video:videoId});

    let like;
    let unlike;

    if(likedVideo){
     unlike =  await Like.deleteOne({video:videoId})
    }
    else{
          like = await Like.create{
                video:videoId,
                owner:userId
            }
    }
    return res
    .status(200)
    .json(new apiResponse (200,{},`Video ${unlike ? "unliked":"liked"} Successfully`))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new apiError(400,"Invalid commentId")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new apiError(401,"Comment not found")
    }

   const likedComment = await Like.findOne({owner:commentId})

   let like;
   let unlike;
   if(likedComment){
    unlike = await Like.deleteOne({owner:commentId})
   }
   else{
    like = await Like.create({
            comment:commentId,
            user:userId
    })
   }
   return res
   .status(200)
   .json( new apiResponse (200,{},`Video ${unlike ? "Unliked":"Liked"} Successfully`))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"tweetId not found")
    }

   const tweet = await tweetId.findById(tweetId)
   if(!tweet){
    throw new apiError(401,"Tweet not found")
   }

   const likedTweet = Like.findOne({owner:userId})
   let like;
   let unlike;
   if(likedTweet){
    unlike = await Like.deleteOne({owner:userId})
   }
   else{
    like = await Like.create({
        tweet:tweetId,
        owner:userId
    })
   }
   return res
   .status(200)
   .json(new apiResponse (200,{},`Tweet ${unlike ? "Unlike" : "Like"} Successfully`))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}