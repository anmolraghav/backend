import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // Match stage for filtering by userId

    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid userId!");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new apiError(404, "User Not available witht this userId!");
    }

    if (userId) {
        pipeline.push({
            $match: {
                owner: new Types.ObjectId(userId)
            }
        })
    }

    // Match stage for based on text query
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }
        });
    }

    // Sort stage
    if (sortBy && sortType) {
        const sortTypeValue = sortType === 'desc' ? -1 : 1;
        pipeline.push({
            $sort: { [sortBy]: sortTypeValue }
        });
    }

    // populate the owner
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            ]
        }
    })

    // add the calculated owner field
    pipeline.push({
        $addFields: {
            owner: {
                $first: "$owner"
            }
        }
    })

    const aggregate = Video.aggregate(pipeline)

    Video.aggregatePaginate(aggregate, { page, limit })
        .then(function (result) {
            return res.status(200).json(new apiResponse(
                200,
                { result },
                "Fetched videos successfully"
            ))
        })
        .catch(function (error) {
            throw error
        })
})

const publishAVideo = asyncHandler(async (req, res) => {
  
    // TODO: get video, upload to cloudinary, create video

    const { title, description, isPublished = true } = req.body;

    // Check if any field is empty
    if (![title, description].every(Boolean)) {
        throw new apiError(400, "All fields are required!");
    }

    // upload video & thumbnail on cloudinary
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new apiError(400, "Video is missing!");
    }

    if (!thumbnailLocalPath) {
        throw new apiError(400, "thumbnail is missing!");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new apiError(500, "Failed to upload video!, try again")
    }

    if (!thumbnail) {
        throw new apiError(500, "Failed to upload thumbnail!, try again")
    }

    // save video details in db
    const video = await Video.create({
        videoFile: { key: videoFile?.public_id, url: videoFile?.url },
        thumbnail: { key: thumbnail?.public_id, url: thumbnail?.url },
        title,
        description,
        duration: videoFile?.duration,
        owner: req.user._id,
        isPublished
    })

    if (!video) {
        throw new apiError(500, "Something went wrong while uploading video, try again")
    }

    return res.status(200).json(new apiResponse(
        200,
        { video },
        "Video uploaded successfully!"
    ))
})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params;

    // check if Invalid videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId!");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if (!video) {
        throw new ApiError(404, "Video not find!")
    }

    return res.status(200).json(new ApiResponse(
        200,
        { video: video[0] },
        "Video fetched successfully"
    ))

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const { videoId } = req.params;

    // Check if any field is empty
    if (![title, description].every(Boolean)) {
        throw new ApiError(400, "All fields are required");
    }

    // check if Invalid videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId!");
    }

    // delete previous thumbnail from cloudinary, if it exists
    const thumbnailLocalPath = req.file?.path;

    const oldVideoDetails = await Video.findOne({ _id: videoId });

    if (!oldVideoDetails) {
        throw new ApiError(404, "Video not find!");
    }

    if (thumbnailLocalPath) {
        await deleteOnCloudinary(oldVideoDetails.thumbnail?.key);
    }

    // upload new thumbnail, if it exists
    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }

    if (!thumbnail && thumbnailLocalPath) {
        throw new ApiError(500, "Failed to upload thumbnail!, please try again");
    }

    // update video with new details
    const updateFields = {
        $set: {
            title,
            description,
        },
    };

    if (thumbnail) {
        updateFields.$set.thumbnail = {
            key: thumbnail.public_id,
            url: thumbnail.url
        };
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        updateFields,
        { new: true });

    if (!updatedVideo) {
        throw new ApiError(500, "Something went wrong while updating video details, try again");
    }

    return res.status(200).json(new ApiResponse(
        200,
        { updatedVideo },
        "Video updated"))

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