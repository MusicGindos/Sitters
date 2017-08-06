'use strict';

// dependencies
const mongoose = require('mongoose'),
    _ = require("lodash"),
    webpush = require('web-push'),
    gcm = require('node-gcm'),
    moment = require('moment'),
    clone = require('clone'),
    matcher = require('./../matcher');

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
    res.status(400).json({
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

async function updateUser(user) {
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
    const result = await updateUser(user);
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


function getMatch(parent, sitter) {
    if (sitter.settings.allowShowOnSearch) {
        // deep clone match object
        sitter.match = clone(matcher.calculateMatchingScore(parent, sitter));
        return sitter.match;
    }
}

exports.getMatches = async(req, res) => {
    const sitters = await getSitters();
    if (sitters) {
        const parent = req.body;
        // flatten sitters to key value pairs (id -> sitterDetails)
        const sittersMap = _.keyBy(_.map(sitters, '_doc'), function (sitter) {
            return sitter._id
        });
        // find sitters that are not blacklisted for this parent
        const whitelist = _.filter(sittersMap, sitter => !(_.includes(parent.blacklist, sitter._id)));

        // find matching sitters in whitelist
        const matchingSitters = whitelist.filter(sitter => getMatch(parent, sitter).matchScore > 50);

        // return a descending ordered list of matching sitters
        res.status(200).json(_.orderBy(matchingSitters, ['matchScore'], ['desc']));
    }
    else {
        error(res, "No sitters found");
    }
};

exports.updateFriends = async (req, res) => {
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

exports.sendInvite = (req, res, next) => {
    const parentID = req.body[0].parentID;
    const sitterID = req.body[0].sitterID;
    Parent.findOne().where('_id', parentID).exec(function (err, parent) {
        if (err) {
            error(res, err);
        }
        else {
            let invite = req.body;
            invite.wasRead = true;
            parent.invites = _.union(parent.invites, invite);

            // Notify sitter
            parent.update({$set: parent}).exec(function (err) {
                if (err) {
                    error(res, err);
                }
                else {
                    // notifications(sitter.pushNotifications, req.body);
                    // if(parent.senderGCM.valid) {
                    //     mobileNotifications(parent.senderGCM.senderId, req.body);
                    // }
                    Sitter.findOne().where('_id', sitterID).exec(function (err, sitter) {
                        if (err) {
                            error(res, err);
                        }
                        else {
                            var invite = _.find(sitter.multipleInvites, function (obj) {
                                return obj._id === parentID;
                            });
                            if (invite) {
                                invite.count += req.body.length;
                            }
                            else {
                                sitter.multipleInvites.push({_id: parentID, count: req.body.length});
                            }
                            _.orderBy(sitter.multipleInvites, ['count'], ['desc']);

                            sitter.invites = _.union(sitter.invites, req.body);
                            sitter._doc.lastInvite = moment().format("DD/MM/YYYY");
                            sitter.update({$set: sitter}).exec(function (err) {
                                if (err) {
                                    error(res, err);
                                }
                                else {
                                    notifications(sitter.pushNotifications, req.body[0]);
                                    if (sitter.senderGCM !== null && typeof sitter.senderGCM !== 'undefined' && sitter.senderGCM.valid) {
                                        mobileNotifications(sitter.senderGCM.senderId, req.body[0]);
                                    }
                                    status(res, "invite created in sitter and parent DB");
                                }
                            });
                        }
                    });
                }
            });
        }
    });

};

exports.updateInvite = (req, res) => {
    let inviteData = req.body.invite;
    Sitter.findOne().where('_id', inviteData.sitterID).exec(function (err, sitter) {
        sitter.invites.forEach(invite => {
            if (invite._id === inviteData._id) {
                invite.status = inviteData.status;
                if (!req.body.isParent) {
                    invite.wasRead = inviteData.wasRead;
                }
            }
        });

        sitter.update({$set: sitter}).exec(function (err) {
            if (err) {
                error(res, err);
            }
            else {
                // TODO : new logic

            }
        });
    });

    Parent.findOne().where('_id', inviteData.parentID).exec(function (err, parent) {
        if (err) {
            console.log(err);
        }
        console.log(parent);
        parent.invites.forEach(invite => {
            if (invite._id === inviteData._id) {
                invite.status = inviteData.status;
                if (req.body.isParent && req.body.action === 'wasRead') {
                    invite.wasRead = true;
                }
            }
        });
        parent.update({$set: parent}).exec(function (err) {
            if (err) {
                error(res, err);
            }
            else if (req.body.action !== 'wasRead') {
                if (inviteData.status !== 'waiting') {
                    notifications(parent.pushNotifications.toObject(), inviteData);
                    if (parent.senderGCM !== null && typeof parent.senderGCM !== 'undefined' && parent.senderGCM.valid) {
                        mobileNotifications(parent.senderGCM.senderId, inviteData);
                    }
                }
                status(res, " updated");
            }
        });
    });
};

function notifications(pushNotifications, data) {
    if (pushNotifications) {
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

function mobileNotifications(senderId, data) {
    // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
    var sender = new gcm.Sender('AIzaSyAy5Z6ByEm4CX3YwohagPTOi0qlMC3XPaU');
    console.log('mobileNotifications');

    // Prepare a message to be sent
    var message = new gcm.Message();
    var messageStr = data.message ? data.message : "New Invite";

    message.addData('data', data);
    message.addNotification('message', data.message ? data.message : "New Invite");

    console.log(message);

    // Specify which registration IDs to deliver the message to
    var regTokens = [senderId];

    // Actually send the message
    sender.send(message, {registrationTokens: regTokens}, function (err, response) {
        if (err) console.error(err);
        else console.log('success');
    });
}