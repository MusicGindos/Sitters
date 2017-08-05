'use strict';

// dependencies
const mongoose = require('../modules/mongoose'),
    axios = require("axios");


exports.index = (req, res, next) => {

};

exports.createUser = (req, res, next) => {
    mongoose.createUser(req, res, next);
};

exports.getUser = (req, res, next) => {
    mongoose.getUser(req, res, next);
};

exports.updateUser = (req, res, next) => {
    mongoose.updateUser(req, res, next);
};

exports.deleteUser = (req, res, next) => {
    mongoose.deleteUser(req, res, next);
};

exports.getMatches = (req, res, next) => {
    mongoose.getMatches(req, res, next);
};

exports.updateFriends = (req, res, next) => {
    mongoose.updateFriends(req, res, next);
};

exports.sendInvite = (req, res, next) => {
    mongoose.sendInvite(req, res, next);
};

exports.sendReview = (req, res, next) => {
    mongoose.sendReview(req, res, next);
};

exports.sendInvite = (req, res, next) => {
    mongoose.sendInvite(req, res, next);
    //get parent
    //get sitter
    //set parent
    //set sitter
    //TODO: insert into parent + sitter db
};

exports.writeReview = (req, res, next) => {
    //get sitter
    //set sitter
//TODO: insert into sitter db only
};

exports.updateInvite = (req, res, next) => {
    mongoose.updateInvite(req, res, next);
};