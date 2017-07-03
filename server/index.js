'use strict';

const mongoose        = require('../modules/mongoose'),
    personalityTest = require('../modules/personalityTest'),
    fs              = require('fs'),
    suggest         = require('../modules/suggestions'),
    axios           = require("axios"),
    webpush         = require('web-push');

let error = (next, msg, status) => {
    let err = new Error();
    err.status = status;
    err.message = msg;
    next(err);
};

let route = (req, res, next, page) => {
    fs.readFile(page, (err, html) => {
        if (err) {
            error(next, err.message, 500);
        }
        res.write(html);
        res.end();
    });
};


exports.index = (req, res, next) => {

};

exports.createParent = (req, res, next) => {
    mongoose.createParent(req,res,next);
};

exports.updateParent = (req, res, next) => {
    mongoose.updateParent(req, res, next);
};

exports.deleteParent = (req, res, next) => {
    mongoose.deleteParent(req,res,next);
};

exports.getParent = (req, res, next) => {
    mongoose.getParent(req,res,next);
};

exports.notifications = (req, res, next) => {
    //const vapidKeys = webpush.generateVAPIDKeys();
    webpush.setGCMAPIKey('AIzaSyC_cF6XxPyOpQXdM01txENJsPfLQ61lDzE'); // const
    webpush.setVapidDetails(
        'mailto:arel-g@hotmail.com', // const
        "BA9TXkOAudBsHZCtma-VftBiXmAc-Ho4M7SwAXRpZDR-DsE6pdMP_HVTTQaa3vkQuHLcB6hB87yiunJFUEa4Pas", // const
        "9wDAtLKaQZh08dyQzkLkXHnLSGbMeeLA0TErWrE_Gjw"
        // vapidKeys.publicKey,
        // vapidKeys.privateKey
    );
    const pushSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/e-xBke4VOxk:APA91bGwl04HFVHQan_PUI1rbpeiC-yjzFJ3dxr1mjJH1m-KWV-aYpRhet2B-mKG06gS-3JkGLlaoWC4AKzY7A68hteHeXrLPVAOb7e-xgZkbB7h_EDniCr_sZTQLF2Kf94jUN_mWjCe',
        keys: {
            auth: 'lNBOO2Yuo2irX1JyHquPWg==',
            p256dh: 'BIzXr1Qj_NEbtqL4RR2xJEYkAGqeGUCCWBHlXMOtzkKgDZj7cUI6KVnd_KbXXYvOPhQlkyuqLRhmSoeoBTaHDFM='
        }
    };
    webpush.sendNotification(pushSubscription, 'Your Push Payload Text');
};

exports.getSitterNow = (req, res, next) => {
    mongoose.getSitterNow(req,res,next);
};

exports.getUser = (req, res, next) => {
    mongoose.getUser(req,res,next);
};


exports.getMatches = (req, res, next) => {
    mongoose.getMatches(req,res,next);
};

exports.updateMutualFriends = (req, res, next) => {
    mongoose.updateMutualFriends(req,res,next);
};

exports.sendInvite = (req, res, next) => {
    mongoose.sendInvite(req,res,next);
};

exports.sendReview = (req, res, next) => {
    mongoose.sendReview(req,res,next);
};

exports.createSitter = (req, res, next) => {
    mongoose.createSitter(req,res,next);
    suggest.newNotification(req.body);
};

exports.updateSitter = (req, res, next) => {
    mongoose.updateSitter(req, res, next);
    //suggest.updateNotification();
};


exports.deleteSitter = (req, res, next) => {
    mongoose.deleteSitter(req,res,next);
    //suggest.deleteNotification();
};

exports.getSitter = (req, res, next) => {
    mongoose.getSitter(req,res,next);
};

exports.getSitters = (req, res, next) => {
    mongoose.getSitters(req,res,next);
};

exports.sendInvite = (req,res,next) =>{
    mongoose.sendInvite(req,res,next);
    //get parent
    //get sitter
    //set parent
    //set sitter
    //TODO: insert into parent + sitter db
};

exports.writeReview = (req,res,next) =>{
    //get sitter
    //set sitter
//TODO: insert into sitter db only
};
