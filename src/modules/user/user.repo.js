'use strict';
const mongoose = require('mongoose');
const { BadrequestError } = require("../../common/core/error.response");
const { toObjectId, getInfoDataWithout, getInfoData } = require("../../common/utils/object.util");
const { normalizeString } = require("../../common/utils/string");
const Friend = require("../friend/friend.model");
const { Schedule } = require("../schedule/schedule.model");
const User = require("./user.model");
const { orderBy } = require('lodash');

const findUserByname = async (name) => {
    try {
        return await User.findOne({ name }).lean()
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const getUserSettings = async (userId) => {
    try {
        const user = await User.findOne({ _id: toObjectId(userId) }).lean();
        return getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'isActive', 'createdAt', 'updatedAt', 'role', 'location', 'authType', 'provider'], object: user });
    } catch (error) {
        throw new BadrequestError('Get user settings failed')
    }
}

const getUserProfile = async (yourId, userId) => {
    try {
        const user = await User.findOne({ _id: toObjectId(userId) }).lean();
        const userFriend = await Friend.findOne({ userId: toObjectId(userId) });
        const userSchedule = await Schedule.find({
            $or: [
                { ownerId: userId },
                { 'members.memberId': userId }
            ],
            isActive: true,
            endDate: { $lt: new Date() }
        }).populate({
            path: 'members.memberId',
            select: 'name email avatar'
        }).select('topic imageUrl members startDate endDate').lean();
        userSchedule.forEach(schedule => {
            schedule.members = schedule.members.map(member => ({
                ...member.memberId,
                permission: member.permission,
                isActive: member.isActive
            }));
        });

        const friendIds = userFriend.friends.map(friend => friend.friendId.toString());
        const requestSentIds = userFriend.friendsRequestSent.map(friend => friend.recipientId.toString());
        const requestReceivedIds = userFriend.friendsRequestReceved.map(friend => friend.senderId.toString());

        if (yourId === userId) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'self',
                schedules: userSchedule
            }
        }
        if (friendIds.includes(yourId)) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'friend',
                schedules: userSchedule
            }
        }
        if (requestReceivedIds.includes(yourId)) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'request-sent',
                schedules: userSchedule
            }
        }
        if (requestSentIds.includes(yourId)) {
            return {
                user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
                status: 'request-received',
                schedules: userSchedule
            }
        }

        return {
            user: getInfoDataWithout({ fields: ['socketId', 'password', '__v', 'providerAccountId', 'provider', 'isActive', 'authType'], object: user }),
            status: 'none'
        }
    } catch (error) {
        throw new BadrequestError('Get profile failed')
    }
}

const updateUserStatus = async (id, status = false) => {
    try {
        await User.findOneAndUpdate({ _id: id }, { isOnline: status })
    } catch (error) {
        throw new Error('Update user socket id failed')
    }
}

const findUserSocketId = async (userId) => {
    try {
        return await User.findOne({ _id: userId }).select('socketId').lean()
    } catch (error) {
        throw new BadrequestError('Find user socket id failed')
    }
}

const findUserById = async (id) => {
    try {
        return await User.findById(
            toObjectId(id)
        )
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email }).lean()
    } catch (error) {
        throw new BadrequestError('Find user failed')
    }
}

const createUser = async ({ name, password, email, ...rest }) => {
    try {
        return await User.create({
            name, password, email, ...rest
        })
    } catch (error) {
        throw new BadrequestError('Create user failed: ', error?.message)
    }
}

const updateOrCreateUser = async (profile) => {
    try {
        const filter = { oathId: profile.id },
            bodyUpdate = {
                oathId: profile.id,
                fullname: profile.displayName,
                Email: profile.emails ? profile.emails[0].value : null
            },
            option = { new: true, upsert: true };
        return await User.findOneAndUpdate(filter, bodyUpdate, option)
    } catch (error) {
        throw new BadrequestError('Create user failed')
    }
}

const findByOAuthAccount = async (provider, providerAccountId) => {
    const user = await User.findOne({ provider, providerAccountId });

    return user;
}

const transformGoogleProfile = async (profile) => {
    return {
        name: profile.name,
        email: profile.email,
        avatar: profile.picture,
        providerAccountId: profile.sub,
        locale: profile.locale
    };
}

const transformFacebookProfile = async (profile) => {
    return {
        name: profile.name,
        email: profile.email,
        avatar: profile.picture?.data?.url,
        providerAccountId: profile.id
    };
}

const searchUsersByName = async (name) => {
    try {
        const normalizedSearchTerm = normalizeString(name);
        const regex = new RegExp(normalizedSearchTerm, 'i');
        const users = await User.find({ role: 'user', isActive: true }).select('name email avatar').lean();

        const filteredUsers = users.filter(user => {
            const normalizedUserName = normalizeString(user.name);
            return regex.test(normalizedUserName);
        });

        return filteredUsers ?? []
    } catch (error) {
        console.log("🚀 ~ searchUsersByName ~ error:::", error);
        throw new BadrequestError('Find user failed')
    }
}

const getUserName = async (userId) => {
    try {
        const user = await User.findById(userId)
        return user.name
    } catch (error) {
        throw new BadrequestError('Get user name failed')
    }
}

const updateUser = async (userId, data) => {
    try {
        return await User.findByIdAndUpdate(userId, data, { new: true })
    } catch (error) {
        throw new BadrequestError('Update user failed')
    }
}

const suggestFriends = async (userId) => {
    try {
        const maxDistanceInKm = 10;
        const locationSuggestions = [];
        const suggestionSet = new Set();

        const [currentUser, user] = await Promise.all([
            Friend.findOne({ userId: userId }).lean(),
            User.findById(userId).select('location').lean()
        ]);

        if (!user) {
            throw new Error('User not found');
        }

        const currentUserFriends = new Set(currentUser ? currentUser.friends.map(friend => friend.friendId) : []);
        const currentUserFriendRequests = new Set(currentUser ? currentUser.friendsRequestSent.map(friend => friend.recipientId) : []);
        const currentUserFriendReveived = new Set(currentUser ? currentUser.friendsRequestReceved.map(friend => friend.senderId) : []);

        const excludeUserIds = new Set([
            ...Array.from(currentUserFriends),
            ...Array.from(currentUserFriendRequests),
            ...Array.from(currentUserFriendReveived),
            userId
        ]);
        const excludeUserIdsArray = Array.from(excludeUserIds);

        // Suggest friends based on user location
        if (user.location?.lat && user.location?.lng) {
            const allUsers = await User.find({
                _id: { $nin: excludeUserIdsArray },
                role: 'user'
            }).select('_id name avatar email location').lean();

            allUsers.forEach(otherUser => {
                if (otherUser.location) {
                    const distance = haversineDistance(user.location, otherUser.location);
                    console.log("🚀 ~ suggestFriends ~ distance:::", distance);
                    if (distance <= maxDistanceInKm) {
                        locationSuggestions.push({
                            ...otherUser,
                            distance: distance.toFixed(1)
                        });
                        suggestionSet.add(otherUser._id.toString());
                    }
                }
            });

            if (locationSuggestions.length >= 10) {
                return locationSuggestions.slice(0, 10).sort((a, b) => a.distance - b.distance);
            }
        }

        // Suggest random friends
        const randomSuggestions = await User.aggregate([
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(userId), $nin: excludeUserIdsArray },
                    role: 'user'
                }
            },
            { $sample: { size: 10 - locationSuggestions.length } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    email: 1
                }
            }
        ]);

        randomSuggestions.forEach(otherUser => {
            if (!suggestionSet.has(otherUser._id?.toString())) {
                if (otherUser.location && otherUser.location.lat && otherUser.location.lng) {
                    const distance = haversineDistance(user.location, otherUser.location);
                    locationSuggestions.push({
                        ...otherUser,
                        distance: distance.toFixed(1)
                    });
                } else {
                    locationSuggestions.push(otherUser);
                }
                suggestionSet.add(otherUser._id.toString());
            }
        });

        return locationSuggestions;
    } catch (error) {
        throw new Error('Failed to suggest friends');
    }
};

const updateUserLocation = async (userId, location) => {
    console.log("🚀 ~ updateUserLocation ~ location:::", location);
    try {
        const userUpdated = await User.findByIdAndUpdate(toObjectId(userId), { location })
        return !!userUpdated
    } catch (error) {
        console.log("🚀 ~ updateUserLocation ~ error:::", error);
        throw new BadrequestError('Update user location failed')
    }
}


const haversineDistance = (coords1, coords2) => {
    const toRad = (value) => value * Math.PI / 180;

    const { lat: lat1, lng: lon1 } = coords1;
    const { lat: lat2, lng: lon2 } = coords2;

    const R = 6371; // bán kính trung bình của Trái Đất

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const getUserInfo = async (userId) => {
    const user = await User.findById(toObjectId(userId)).lean()
    return {
        user: getInfoData({ fields: ['avatar', 'name', '_id', 'socketId'], object: user }),
        createdAt: new Date(),
        updatedAt: new Date()
    }
}

module.exports = {
    findUserByname,
    findUserByEmail,
    findUserSocketId,
    createUser,
    findUserById,
    updateOrCreateUser,
    updateUserStatus,
    findByOAuthAccount,
    transformGoogleProfile,
    transformFacebookProfile,
    searchUsersByName,
    getUserName,
    getUserProfile,
    getUserSettings,
    updateUser,
    suggestFriends,
    updateUserLocation,
    getUserInfo
}


// const suggestFriends = async (userId) => {
//     try {
//         const maxDistanceInKm = 10;
//         const maxDistanceInRadians = maxDistanceInKm / 6378.1;
//         let locationSuggestions = [];

//         const [currentUser, user] = await Promise.all([
//             Friend.findOne({ userId: userId }).lean(),
//             User.findById(userId).select('location').lean()
//         ]);

//         const currentUserFriends = currentUser ? currentUser.friends.map(friend => friend.friendId) : [];

//         const suggestionSet = new Set(); // To track unique user IDs

//         // Gợi ý theo vị trí
//         if (user?.location?.lat && user?.location?.lng) {
//             console.log('User location:', user.location);
//             console.log('Max distance in radians:', maxDistanceInRadians);

//             const allUsers = await User.find({
//                 _id: { $ne: userId, $nin: currentUserFriends },
//                 role: 'user'
//             }).select('_id name avatar email location').lean();

//             // Lọc các người dùng trong khoảng cách tối đa
//             locationSuggestions = allUsers.filter(otherUser => {
//                 if (otherUser.location && otherUser.location.lat && otherUser.location.lng) {
//                     const distance = haversineDistance(user.location, otherUser.location);
//                     return distance <= maxDistanceInKm;
//                 }
//                 return false;
//             }).slice(0, 10);

//             locationSuggestions.forEach(user => suggestionSet.add(user._id.toString()));

//             console.log('Location suggestions:', locationSuggestions);

//             // Nếu đủ số lượng gợi ý, trả về kết quả
//             if (locationSuggestions.length >= 10) {
//                 return locationSuggestions;
//             }
//         }

//         // Gợi ý theo bạn chung
//         const commonFriendsSuggestions = await Friend.aggregate([
//             {
//                 $match: {
//                     userId: { $ne: new mongoose.Types.ObjectId(userId) },
//                     'friends.friendId': { $in: currentUserFriends }
//                 }
//             },
//             {
//                 $project: {
//                     userId: 1,
//                     mutualFriends: {
//                         $size: {
//                             $filter: {
//                                 input: "$friends",
//                                 as: "friend",
//                                 cond: { $in: ["$$friend.friendId", currentUserFriends] }
//                             }
//                         }
//                     }
//                 }
//             },
//             {
//                 $match: {
//                     mutualFriends: { $gt: 0 }
//                 }
//             },
//             {
//                 $sort: { mutualFriends: -1 }
//             },
//             {
//                 $limit: 10 - locationSuggestions.length
//             }
//         ]);

//         const commonFriendIds = commonFriendsSuggestions.map(friend => friend.userId);
//         const commonFriendUsers = await User.find({
//             _id: { $in: commonFriendIds, $nin: currentUserFriends, $ne: userId },
//             role: 'user'
//         }).select('_id name avatar email').lean();

//         commonFriendUsers.forEach(user => {
//             if (!suggestionSet.has(user._id.toString())) {
//                 locationSuggestions.push(user);
//                 suggestionSet.add(user._id.toString());
//             }
//         });

//         // Nếu vẫn chưa đủ, gợi ý người dùng ngẫu nhiên
//         if (locationSuggestions.length < 10) {
//             const randomSuggestions = await User.aggregate([
//                 {
//                     $match: {
//                         _id: { $ne: new mongoose.Types.ObjectId(userId), $nin: currentUserFriends },
//                         role: 'user'
//                     }
//                 },
//                 { $sample: { size: 10 - locationSuggestions.length } },
//                 {
//                     $project: {
//                         _id: 1,
//                         name: 1,
//                         avatar: 1
//                     }
//                 }
//             ]);

//             randomSuggestions.forEach(user => {
//                 if (!suggestionSet.has(user._id.toString())) {
//                     locationSuggestions.push(user);
//                     suggestionSet.add(user._id.toString());
//                 }
//             });
//         }

//         return locationSuggestions;
//     } catch (error) {
//         console.error('Failed to suggest friends:', error);
//         throw new Error('Failed to suggest friends');
//     }
// };