import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError, apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    //TODO: get video by id

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid videoId")
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid videoId")
    }
    if(video.videoFile){
        await deleteOnCloudinary(video.videoFile.key,"video")
    }

    if(video.thumbnail){
        await deleteOnCloudinary(video.thumbnail.key)
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new apiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    if(!videoId){
        throw new apiError(400,"Invalid videoId")
    }

    const video = await Video.findById(videoId)
    
    if(!video){
        throw new apiError(401,"video not found")
    }

    video.isPublished = !video.isPublished ;
    
    await video.save();

    return res
    .status(200)
    .json(new apiResponse(200,{},"Toggle pulish status successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}