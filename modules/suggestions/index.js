'use strict';

var matcher         = require('../matcher'),
    forEach         = require("lodash").forEach,
    db              = require('../mongoose'),
    notification    = require('../schemas/parent').Notification;

let MESSAGE_NEW = "New Sitter Available";
let MESSAGE_UPDATE = "One Of your Sitters Updated His Data";
let MESSAGE_DELETE = "One Of your Sitters decided to leave Sitters :(";
let NO_MATCH = 0;

exports.newNotification = (sitter) => {
    let parents = db.getParent();
    forEach(parents, (parent) => {
        let score = matcher.calculateMatchingScore();
        if(score != NO_MATCH) {
            parent.matches.push({sitter, score});
            notification.message = MESSAGE_NEW;
            notification.new = true;
            notification.time = new Date().getTime();
            parent.notifications.push(notification);
        }
        db.updateParent(parent);
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