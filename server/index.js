'use strict';

let mongoose        = require('../modules/mongoose'),
    personalityTest = require('../modules/personalityTest'),
    fs              = require('fs'),
    suggest         = require('../modules/suggestions');

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

exports.sendInvite = (req, res, next) => {
    mongoose.sendInvite(req,res,next);
};

exports.sendReview = (req, res, next) => {
    mongoose.sendReview(req,res,next);
};

exports.createSitter = (req, res, next) => {
    mongoose.createSitter(req,res,next);
    suggest.newNotification();
};

exports.updateSitter = (req, res, next) => {
    mongoose.updateSitter(req, res, next);
    suggest.UpdateNotification();
};

exports.deleteSitter = (req, res, next) => {
    mongoose.deleteSitter(req,res,next);
    suggest.deleteNotification();
};

exports.getSitter = (req, res, next) => {
    mongoose.getSitter(req,res,next);
};

exports.sendInvite = (req,res,next) =>{
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
