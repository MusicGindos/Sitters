'use strict';
let mongoose = require('mongoose'),
    Parent = require('../schemas/parent').Parent,
    Sitter = require('../schemas/sitter').sitterModel,
    base = require('../schemas/base'),
    gcm = require('node-gcm'),
    db,
    moment = require('moment'),
    clone = require('clone'),
    matcher = require('./../matcher'),
    config = {
        mongoUrl: 'mongodb://sitter:123456@ds157499.mlab.com:57499/sitter'
    },
    finish = true,
    _ = require("lodash"),
    webpush         = require('web-push');


let error = (res, error) => {
    console.log(error.message);
    res.status(400).json({
        'error': error.message
    });
};

let status = (res, status) => {
    res.status(200).json({'status': status});
};

console.log('connection');

//The server option auto_reconnect is defaulted to true
let options = {
    server: {
        auto_reconnect: true,
    }
};
mongoose.connect(config.mongoUrl, options);
db = mongoose.connection;// a global connection variable

// Event handlers for Mongoose
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

//Parent
exports.createParent = (req, res) => {
    let parent = new Parent(req.body);
    parent.save(function (err) {
        if (err) {
            error(res, err);
        }
        else {
            status(res, req.body.email + " created");
        }
    });
};

exports.updateParent = (req, res) => {
    Parent.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.update({$set: req.body}).exec(function (err) {
            if (err) {
                error(res, err);
            }
            else {
                console.log(req.body.invites[0]);
                mobileNotifications(req.body.senderId, req.body.invites[0]);
                status(res, req.body.email + " updated");
            }
        });
    });
};

exports.deleteParent = (req, res) => {
    Parent.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.remove(function (err) {
            if (err) {
                error(res, err);
            }
            else {
                status(res, req.body.email + " deleted");
            }
        });
    });
};



function isMatch(parent, sitter) {
    // let median = parent.matchBI.median? parent.matchBI.median: 40;
    if(sitter.settings.allowShowOnSearch){
        sitter.match = clone(matcher.calculateMatchingScore(parent, sitter));
        sitter.matchScore = sitter.match.matchScore;
        if(sitter.match.matchScore > 50) return sitter.match;
    }
}

exports.getMatches = (req, res) => {
    Sitter.find(function (err, sitters) {
        if (err) {
            error(res, err);
        }
        else {
            const parent = req.body;
            const allSitters = _.keyBy(_.map(sitters, '_doc'), function(sitter) {return sitter._id});
            const whitelist = _.filter(allSitters, sitter => !(_.includes(parent.blacklist, sitter._id)));
            const descendingScoreList = whitelist.filter(sitter => isMatch(parent, sitter));
            res.status(200).json(_.orderBy(descendingScoreList, ['matchScore'], ['desc']));
        }
    });
};

exports.getParent = (req, res) => {
    Parent.findOne().where('_id', req.body._id).exec(function (err, doc) {
        if (err) {
            error(res, err);
        }
        else {
            // mobileNotifications(req.body.pushNotifications, req.body);
            res.status(200).json(doc);
        }
    });
};

exports.getParents = () => {
    Parent.find(function (err, parents) {
        if (err) {
            console.log(err);
        }
        else {
            return parents;
        }
    });
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

function setMutualFriends(user) {
    if(user.isParent){
        Parent.findOne().where('_id', user._id).exec(function (err, doc) {
            doc.update({$set: user}).exec(function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('mutual friends updated');
                }
            });
        });
    }
    else{
        Sitter.findOne().where('_id', user._id).exec(function (err, doc) {
            doc.update({$set: user}).exec(function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('mutual friends updated');
                }
            });
        });
    }

};

exports.updateMutualFriends = (req, res) => {
    let user = req.body;
    Parent.find(function (err, parents) {
        if (err) {
            console.log(err);
        }
        else{
            Sitter.find(function (err, sitters) {
                if (err) { // the user doesn't exists
                    console.log(err);
                }
                else {
                    let users = _.union(parents,sitters);
                    for(let index = 0; index < user.friends.length; index++){
                        for(let j = 0; j < users.length; j++){
                            if(users[j]._id === user.friends[index].id){
                                user.friends[index].picture = users[j].profilePicture;
                                break;
                            }
                        }
                    }
                    setMutualFriends(user);
                    status(res,"friends updated");
                }
            });
        }

    });
};

//Sitter
exports.createSitter = (req, res) => {
    let sitter = new Sitter(req.body);
    sitter.save(function (err) {
        if (err) {
            error(res, err);
        }
        else {
            status(res, req.body.email + " created");
        }
    });
};

exports.updateSitter = (req, res) => {
    Sitter.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.update({$set: req.body}).exec(function (err) {
            if (err) {
                error(res, err);
            }
            else {
                status(res, req.body.email + " updated");
            }
        });
    });
};

exports.deleteSitter = (req, res) => {
    Sitter.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.remove(function (err) {
            if (err) {
                error(res, err);
            }
            else {
                status(res, req.body.email + " deleted");
            }
        });
    });
};

exports.getSitter = (req, res) => {
    Sitter.findOne().where('_id', req.body._id).exec(function (err, doc) {
        if (err) {
            error(res, err);
        }
        else {
            res.status(200).json(doc);
        }
    });
};

exports.getSitters = (req, res) => {
    Sitter.find(function (err, sitters) {
        if (err) {
            error(res, err);
        }
        else {
            res.status(200).json(sitters);
        }
    });
};

exports.getUser = (req, res) => {
    Parent.findOne().where('_id', req.body._id).exec(function (err, parent) {
        if (parent === null) {
            //error(res,err);
            Sitter.findOne().where('_id', req.body._id).exec(function (err, sitter) {
                if (err) { // the user doesn't exists
                    res.status(200).json({'error': "user doesn't exist"});
                }
                else {
                    res.status(200).json(sitter);
                }
            });
        }
        else {
            res.status(200).json(parent);
        }
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
            parent.invites = _.union(parent.invites, req.body);
            parent.update({$set: parent}).exec(function (err) {
                if (err) {
                    error(res,err);
                }
                else {
                    notifications(parent.pushNotifications, req.body);
                    mobileNotifications(parent.senderId, req.body);
                    Sitter.findOne().where('_id', sitterID).exec(function (err, sitter) {
                        if (err) {
                            error(res,err);
                        }
                        else {
                            var invite = _.find(sitter.multipleInvites, function(obj) {
                                return obj._id === parentID;
                            });
                            if(invite){
                                invite.count += req.body.length;
                            }
                            else{
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
                                    status(res,"invite created in sitter and parent DB");
                                }
                            });
                        }
                    });
                }
            });
        }
    });

};

function notifications(pushNotifications, data) {
    //const vapidKeys = webpush.generateVAPIDKeys();
    webpush.setGCMAPIKey('AIzaSyC_cF6XxPyOpQXdM01txENJsPfLQ61lDzE'); // const
    webpush.setVapidDetails(
        'mailto:arel-g@hotmail.com', // const
        "BA9TXkOAudBsHZCtma-VftBiXmAc-Ho4M7SwAXRpZDR-DsE6pdMP_HVTTQaa3vkQuHLcB6hB87yiunJFUEa4Pas", // const
        "9wDAtLKaQZh08dyQzkLkXHnLSGbMeeLA0TErWrE_Gjw"
        // vapidKeys.publicKey,
        // vapidKeys.privateKey
    );
    // const pushSubscription = pushNotifications;

    webpush.sendNotification(pushNotifications, JSON.stringify(data));
}

function mobileNotifications(senderId, data) {
    // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
    var sender = new gcm.Sender('AIzaSyAy5Z6ByEm4CX3YwohagPTOi0qlMC3XPaU');
    console.log('mobileNotifications');

    // Prepare a message to be sent
    var message = new gcm.Message({
        data: { data: data },
        notification: {
            title: "Sitters",
            icon: "ic_launcher",
            body: data.message ? data.message : "New Invite"
        }
    });

    // Specify which registration IDs to deliver the message to
    var regTokens = [senderId];

    // Actually send the message
    sender.send(message, { registrationTokens: regTokens }, function (err, response) {
        if (err) console.error(err);
        else console.log(response);
    });
}