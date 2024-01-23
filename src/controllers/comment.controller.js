import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid videoId")
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new Types.ObjectId(videoId)
            }
        }
    ])

    Comment.aggregatePaginate(aggregate, { page, limit })
        .then(function (result) {
            return res.status(200).json(new ApiResponse(
                200,
                { result },
                "Video Comment fetched successfully"
            ))
        })
        .catch(function (error) {
            throw error
        })

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.query
    const userId = req.user._id
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid videoId")
    }

    if(!content){
        throw new apiError(401,"Content is required")
    }

   const video = await Video.findById(videoId)

   if(!video){
    throw new apiError(403,"Video not found")
   }

   const comment = await Comment.create({
    content,
    owner: userId,
    video:videoId
   })

   return res
   .status(200)
   .json(new apiResponse(200,{comment},"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const userId = req.user._id
    const{commentId} = req.query
    const {newContent} = req.body

    if(!isValidObjectId(commentId)){
        throw new apiError(400,"Invalid commentId")
    }
    if(!newContent){
        throw new apiError(401,"Comment is required")
    }
    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new apiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== userId){
        throw new apiError(403,"You are not permitted to update the comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
               content: newContent
            }
        },
            {
                new:true
            }
        
    )

    if(!updateComment){
        throw new apiError(404,"Something went wrong while updating the comment")
    }
    return res
    .status(200)
    .json(new apiError(200,{updateComment},"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const userId  = req.user._id

    if(!isValidObjectId(commentId)){
        throw new apiError(400,"Invalid commentId")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new apiError(404,"Comment not found")
    }
    if(comment.owner.toString() !== userId){
        throw new apiError(402,"You are not authorized to delete the comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deleteComment){
        throw new apiError(500,"Somethign went wrong while deleting the comment")
    }

    return res
    .status(200)
    .json(new apiResponse(200,{},"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }