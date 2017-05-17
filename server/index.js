'use strict';

let mongoose        = require('../modules/mongoose'),
    personalityTest = require('../modules/personalityTest'),
    fs              = require('fs'),
    suggest         = require('../modules/suggestions'),
    axios           = require("axios");

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
    //mongoose.notifications(req,res,next);
    axios({
        method: 'post',
        url: 'https://fcm.googleapis.com/fcm/send/cW2cKehQ8CQ:APA91bGkWeWQlgVEvwZUF4uoPFzddY3PX04_Wy-yV-TIgI7fLWrTqTVp5q4XXx5DNcmwsP6S6y_uqLTA0yp4t7uj5EeJQtLI_AzMRbkONOmv9pyEH-CY9wTDoHndo4Ey7MiSDTdrPk6T',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Content-Length': '0',
            'TTL': '60',
            'Authorization': 'WebPush eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJodHRwczovL2ZjbS5nb29nbGVhcGlzLmNvbSIsImV4cCI6MTQ5NTA5NDU2NCwic3ViIjoibWFpbHRvOnNpbXBsZS1wdXNoLWRlbW9AZ2F1bnRmYWNlLmNvLnVrIn0.8qCZ88y0NUEmmQxKfXFV5AYyKuURYAio6eewlnRAlXAxrzbUxFgDfDbzcy986m3Nw-_1NIyqZ67uQf0MCdQAUQ',
            'Crypto-Key':'p256ecdsa=BDd3_hVL9fZi9Ybo2UUzA284WG5FZR30_95YeZJsiApwXKpNcF1rRPF3foIiBHXRdJI2Qhumhf6_LFTeZaNndIo'
        },
    }).then(function (res) {
        console.log("hello");
        res.json({'status':"successfully"});
    })
        .catch(function (error) {
            console.log(error);
            //TODO: think about error when user not created
        });
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
