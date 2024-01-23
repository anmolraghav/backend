import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError, apiError} from "../utils/ApiError.js"
import {ApiResponse, apiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new apiError(400,"Invalid channelId")
    }
    const channel = await User.findById(channelId)

    if(!channel){
        throw new apiError(400,"channel not found")
    }
    if(channelId.toString() === userId){
        throw new apiError(401,"You can not subscribe your own channel")
    }

    const subscription = await Subscription.findOne({channel:channelId})
    let subscribe;
    let unsubscribe;
    if(subscription){
        unsubscribe = await Subscription.findOneAndDelete({
            subscriber:userId,
            channel:channelId

        })
        else{
            subscribe = await Subscription.create({
                subscriber = userId,
                channel : channelId
            })
        }
        return res
        .status(200)
        .json(new apiResponse(200,{},`Channel ${subscription? "Unsubscribe":"Subscribe"} successfully`))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}