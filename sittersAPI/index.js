'use strict';

// dependencies
const dbHandler = require('../modules/dbHandler'),
    axios = require("axios");


exports.index = (req, res, next) => {

};

exports.createUser = (req, res, next) => {
    dbHandler.createUser(req, res, next);
};

exports.getUser = (req, res, next) => {
    dbHandler.getUser(req, res, next);
};

exports.updateUser = (req, res, next) => {
    dbHandler.updateUser(req, res, next);
};

exports.deleteUser = (req, res, next) => {
    dbHandler.deleteUser(req, res, next);
};

exports.getMatches = (req, res, next) => {
    dbHandler.getMatches(req, res, next);
};

exports.updateFriends = (req, res, next) => {
    dbHandler.updateFriends(req, res, next);
};

exports.sendInvite = (req, res, next) => {
    dbHandler.sendInvite(req, res, next);
};

exports.updateInvite = (req, res, next) => {
    dbHandler.updateInvite(req, res, next);
};