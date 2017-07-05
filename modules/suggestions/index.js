'use strict';

let matcher         = require('../matcher'),
    forEach         = require("lodash").forEach,
    db              = require('../mongoose'),
    Notification    = require('../schemas/parent').Notification,
    clone           = require('clone'),
    Parent = require('../schemas/parent').Parent,
    Sitter = require('../schemas/sitter').sitterModel;
var uuid = require("uuid"),
    webpush         = require('web-push');

let MESSAGE_NEW = "New Sitter Available";
let MESSAGE_UPDATE = "One Of your Sitters Updated His Data";
let MESSAGE_DELETE = "One Of your Sitters decided to leave Sitters :(";


exports.newNotification = (sitter) => {
    const s = new Sitter(sitter);
    Parent.find(function (err, parents) {
        if (err) {
            console.log(err);
        }
        else {
            forEach(parents, (parent) => {
                const match = clone(matcher.calculateMatchingScore(parent, s));
                if(match.matchScore > 0) {
                    const notification = {
                        _id: uuid.v1(),
                        message: MESSAGE_NEW,
                        wasRead: false,
                        date: new Date().getTime(),
                        sitterName: sitter.name,
                        sitterID: sitter._id,
                        sitterPicture: sitter.profilePicture
                    };
                    parent.notifications.push(notification);
                    Parent.findOne().where('_id', parent._id).exec(function (err, doc) {
                        doc.update({$set: parent}).exec(function (err) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                notifications(parent.pushNotifications, notification);
                                console.log("notification added");
                            }
                        });
                    });

                }
            });
        }
    });
};

exports.updateNotification = (sitter) => {
    let parents = db.getParent();
    forEach(parents, (parent) => {
        forEach(parent.matches, (match) => {
            if(sitter.email == match.sitter.email){
                match.sitter = sitter;
                match.match_score = matcher.calculateMatchingScore();
            }
        });
        notification.message = MESSAGE_UPDATE;
        notification.new = true;
        notification.time = new Date().getTime();
        parent.notifications.push(notification);
        db.updateParent(parent);
    });
};

exports.deleteNotification = (sitter) => {
    let parents = db.getParent();
    forEach(parents, (parent) => {
        forEach(parent.matches, (match) => {
            if(sitter.email == match.sitter.email){
                parent.remove(this);
            }
        });
        notification.message = MESSAGE_DELETE;
        notification.new = true;
        notification.time = new Date().getTime();
        parent.notifications.push(notification);
        db.updateParent(parent);
    });
};

function notifications(pushNotifications, data) {
    if(pushNotifications){
        //const vapidKeys = webpush.generateVAPIDKeys();
        webpush.setGCMAPIKey('AIzaSyC_cF6XxPyOpQXdM01txENJsPfLQ61lDzE'); // const
        webpush.setVapidDetails(
            'mailto:arel-g@hotmail.com', // const
            "BA9TXkOAudBsHZCtma-VftBiXmAc-Ho4M7SwAXRpZDR-DsE6pdMP_HVTTQaa3vkQuHLcB6hB87yiunJFUEa4Pas", // const
            "9wDAtLKaQZh08dyQzkLkXHnLSGbMeeLA0TErWrE_Gjw"
        );
        webpush.sendNotification(pushNotifications, JSON.stringify(data));
    }
}