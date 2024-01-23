import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/ApiResponse.js"
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
    }
        else {
            subscribe = await Subscription.create({
                subscriber : userId,
                channel : channelId
            })
        }
        return res
        .status(200)
        .json(new apiResponse(200,{},`Channel ${subscription? "Unsubscribe":"Subscribe"} successfully`))
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // check if Invalid channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    // check if channel not available
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not find!");
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                channel: new Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberLists",
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
        },
        {
            $addFields: {
                subscriberLists: {
                    $first: "$subscriberLists"
                }
            }
        }
    ])

    return res.status(200).json(new ApiResponse(
        200,
        { subscriberLists: subscriptions[0]?.subscriberLists || [] },
        "Subscriber lists fetched successfully"
    ))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // check if Invalid subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    // check if subscriber not available
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not find!");
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannelLists",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribedChannelLists: {
                    $first: "$subscribedChannelLists"
                }
            }
        }
    ])

    return res.status(200).json(new ApiResponse(
        200,
        { subscribedChannelLists: subscriptions[0]?.subscribedChannelLists || [] }
    ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}