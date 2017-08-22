'use strict';

// dependencies
const mongoose = require('mongoose'),
    _ = require("lodash"),
    moment = require('moment'),
    pushNotifications = require('./../pushNotifications');

// schemes
const base = require('../schemas/base'),
    Parent = require('../schemas/parent').Parent,
    Sitter = require('../schemas/sitter').sitterModel;

// configurations
const config = {mongoUrl: 'mongodb://sitter:123456@ds157499.mlab.com:57499/sitter'};
const options = {
    server: {
        auto_reconnect: true,
    }
};

// response objects
let error = (res, error) => {
    console.log(error.message);
    res.status(404).json({
        'error': error.message
    });
};

let status = (res, status) => {
    res.status(200).json({'status': status});
};

mongoose.connect(config.mongoUrl, options);
let db = mongoose.connection;// a global connection variable

// event handlers for Mongoose
db.on('error', function (err) {
    console.log('Mongoose: Error: ' + err);
});
db.on('open', function () {
    console.log('Mongoose: Connection established');
});
db.on('disconnected', function () {
    console.log('Mongoose: Connection stopped, reconnect');
    mongoose.connect(config.mongoUrl, options);
});
db.on('reconnected', function () {
    console.info('Mongoose reconnected!');
});

db.once('open', function () { // if needed to do action once got connection

});

async function getParent(user_id) {
    try {
        return await Parent.findOne().where('_id', user_id);
    }
    catch (error) {
        return error;
    }
}

async function getSitter(user_id) {
    try {
        return await Sitter.findOne().where('_id', user_id);
    }
    catch (error) {
        return error;
    }
}

async function getParents() {
    try {
        return await Parent.find({});
    }
    catch (error) {
        return error;
    }
}

async function getSitters() {
    try {
        return await Sitter.find({});
    }
    catch (error) {
        return error;
    }
}

async function update(user) {
    try {
        await user.update({$set: user}, function (result) {
            return result;
        });
    }
    catch (error) {
        return error;
    }
}

exports.createUser = (req, res) => {
    let user = req.body.isParent ? new Parent(req.body) : new Sitter(req.body);
    user.save(function (err) {
        if (err) {
            error(res, err);
        }
        else {
            if (!user.isParent)
                status(res, req.body.name + " created");
        }
    });
};

exports.getUser = async(req, res) => {
    let user;
    const user_id = req.body._id;
    user = await getParent(user_id);
    if (user) res.status(200).json(user);
    else user = await getSitter(user_id);
    user ? res.status(200).json(user) : res.status(404).json({error: 'User not found'});
};

exports.updateUser = async(req, res, next) => {
    let user;
    if (req.body.isParent) {
        user = new Parent(req.body);
        // empty parent blacklist
        user.blacklist = [];
    }
    else {
        user = new Sitter(req.body);
        // remove sitter from parents blacklists
        const parents = await getParents();
        _.forEach(parents, parent => {
            let index = parent.blacklist.indexOf(user._id);
            index ? parent.blacklist.splice(index, 1) : _.noop();
        });
    }
    const result = await update(user);
    result ? error(res, result) : status(res, user.name + " updated");
};

exports.deleteUser = async(req, res, next) => {
    let user;
    const user_id = req.body._id;
    user = await getParent(user_id);
    if (user) res.status(200).json(user);
    else user = await getSitter(user_id);
    user.remove(function (err) {
        if (err) {
            error(res, err);
        }
        else {
            status(res, user.name + " deleted");
        }
    });
};

function updateMultipleInvites(multipleInvites, invites) {
    let sitterInvite = _.find(multipleInvites, function (obj) { // find parent in multiple invites
        return obj._id === invites[0].parentID;
    });
    if (sitterInvite) // if parent was found - counter ++
        sitterInvite.count += invites.length;
    else // add parent to multiple invites with count=invites.length
        multipleInvites.push({_id: invites[0].parentID, count: invites.length});
    _.orderBy(multipleInvites, ['count'], ['desc']);
}

exports.updateFriends = async(req, res) => {
    let user = req.body;
    const parents = await
        getParents();
    const sitters = await
        getSitters();
    const users = _.union(parents, sitters);
    for (let index = 0; index < user.friends.length; index++) {
        for (let j = 0; j < users.length; j++) {
            if (users[j]._id === user.friends[index].id) {
                user.friends[index].picture = users[j].profilePicture;
                break;
            }
        }
    }
    const result = await updateUser(user);
    result ? error(res, result) : status(res, user.name + " friends updated");
};


exports.addSitterToBlacklist = (parent) => {
    Parent.findOne().where('_id', parent._id).exec(function (err, doc) {
        doc.update({$set: parent}).exec(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('blacklist updated');
            }
        });
    });
};

exports.sendInvite = async(req, res, next) => {
    const invites = req.body;
    const parent = await getParent(invites[0].parentID);
    const sitter = await getSitter(invites[0].sitterID);
    let parentInvites = invites;

    //parent
    parentInvites.forEach(function (invite) {
        invite.wasRead = true;
    });
    // add invites to parent invites
    parent.invites = _.union(parent.invites, parentInvites);
    const result = await update(parent);

    //sitter
    if (!result) {
        updateMultipleInvites(sitter.multipleInvites, invites);
        // add invites to sitter invites
        sitter.invites = _.union(sitter.invites, invites);
        sitter.lastInvite = moment().format("DD/MM/YYYY");
        const response = await update(sitter);

        if (response)
            error(res, response);
        else {
            // send notification to sitter
            pushNotifications.sendPushNotification(sitter.pushNotifications, sitter.senderGCM, invites[0]);
            status(res, "invite created by " + parent.name + "and sent to " + sitter.name);
        }
    }
    else
        error(res, result);
};

exports.updateInvite = async(req, res) => {
    const inviteData = req.body.invite;
    const parent = await getParent(inviteData.parentID);
    const sitter = await getSitter(inviteData.sitterID);

    // sitter
    sitter.invites.forEach(invite => {
        if (invite._id === inviteData._id) {
            invite.status = inviteData.status;
            invite.wasRead = inviteData.wasRead;
        }
    });
    let result = await updateUser(sitter);

    //parent
    parent.invites.forEach(invite => {
        if (invite._id === inviteData._id) {
            invite.status = inviteData.status;
            if (req.body.action === 'wasRead') invite.wasRead = true;
        }
    });

    result = await updateUser(parent);

    if (result) error(res, result);
    else if (req.body.action !== 'wasRead' && inviteData.status !== 'waiting')
        pushNotifications.sendPushNotification(parent.pushNotifications.toObject(), parent.senderGCM, inviteData);

    status(res, "invite updated");

};

module.exports.getParents = getParents;
module.exports.getSitters = getSitters;
module.exports.update = update;