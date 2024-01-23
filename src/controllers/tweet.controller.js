import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const userId = req.user?._id

    if(!content){
        throw new apiError(400,"Tweet content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner:userId
    })

    if(!tweet){
        throw new apiError(500,"Something went wrong while creating tweet")
    }

    return res
    .status(200)
    .json(new apiResponse(200,{},"tweet is created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    
   
})


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {newContent} = req.body
    const {tweetId} = req.params
    const UserId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"Invalid tweet Id !")
    }

    if(!newContent){
        throw new apiError(401,"newContent is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new apiError(404,"tweet not found")
    }

    if(tweet.owner.toString()!==UserId){
        throw new apiError(403,"You do not have permission to update this tweet")
    }

    const newTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
           $set :{content:newContent} 
        },
        new:true)

        if(!newTweet){
            throw new apiError(500,"Something went wrong while updating the tweet")
        }

        return res
        .status(200)
        .json(200,{tweet:newTweet},"tweet updated successfully")

    
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params
    const UserId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new apiError(401,"Invalid tweet Id!")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new apiError(404,"Tweet not found")
    }

    if(tweet.owner.toString()!==UserId){
        throw new apiError(403,"You do not permission to delete tweet !")
    }

    const deleteTweet = Tweet.findByIdAndDelete(tweetId)

    if(!deleteTweet){
        throw new apiError(500,"Something went wrong while deleting the tweet")
    }

    return res
    .status(200)
    .json(200,{},"Tweet deleted successfully")
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}