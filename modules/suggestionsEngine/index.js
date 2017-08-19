'use strict';

//dependencies
const matcher = require('../matcher'),
    _ = require("lodash"),
    uuid = require("uuid"),
    dbHandler = require('../dbHandler'),
    pushNotifications = require('../pushNotifications');

//schemas
const Sitter = require('../schemas/sitter').sitterModel;

// statics
const NEW_SITTER_MSG = "New Sitter Available";

function createNotification(sitter, match) {
    return {
        _id: uuid.v1(),
        message: NEW_SITTER_MSG,
        wasRead: false,
        date: new Date().getTime(),
        sitterName: sitter.name,
        sitterID: sitter._id,
        sitterImage: sitter.profilePicture,
        sitter: {
            sitterName: sitter.name,
            profilePicture: sitter.profilePicture,
            coverPhoto: sitter.coverPhoto,
            personality: sitter.personality
        },
        match: match
    };
}

function notifyParents(parents, sitter) {
    _.forEach(parents, (parent) => {
        const match = matcher.computeMatch(parent, sitter);
        if (match.matchScore > 50) {
            const notification = createNotification(sitter, match);
            parent.notifications.push(notification);
            let sitterData = sitter.toObject();
            dbHandler.updateUser(parent).then(function () {
                sitterData.match = match;
                sitterData.matchScore = match.matchScore;
                const notificationData = {
                    notification: notification,
                    sitter: sitterData
                };
                pushNotifications.sendPushNotification(parent.pushNotifications.toObject(), parent.senderGCM, notificationData);
            });
        }
    });
}

exports.newSitterSuggestion = async(sitter) => {
    const sitterObj = new Sitter(sitter);
    const parents = dbHandler.getParents();
    notifyParents(parents, sitterObj);
};