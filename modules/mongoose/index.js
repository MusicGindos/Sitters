'use strict';
let mongoose = require('mongoose'),
    Parent = require('../schemas/parent').Parent,
    Sitter = require('../schemas/sitter').sitterModel,
    base = require('../schemas/base'),
    db,
    moment = require('moment'),
    clone = require('clone'),
    matcher = require('./../matcher'),
    config = {
        mongoUrl: 'mongodb://sitter:123456@ds157499.mlab.com:57499/sitter'
    },
    finish = true,
    _ = require("lodash");


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
    let median = parent.matchBI.median? parent.matchBI.median: 40;
    sitter.match = clone(matcher.calculateMatchingScore(parent, sitter));
    sitter.matchScore = sitter.match.matchScore;
    if(sitter.match.matchScore >= median) return sitter.match;
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

function setMutualFriends(parent) {
    Parent.findOne().where('_id', parent._id).exec(function (err, doc) {
        doc.update({$set: parent}).exec(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('mutual friends updated');
            }
        });
    });
};

// Sitter.find(function (err, sitters) {
exports.updateMutualFriends = (req, res) => {
    let parent = req.body;
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
                    for(let index = 0; index < parent.mutualFriends.length; index++){
                        for(let j = 0; j < users.length; j++){
                            if(users[j]._id === parent.mutualFriends[index].id){
                                parent.mutualFriends[index].picture = users[j].profilePicture;
                                break;
                            }
                        }
                    }
                    setMutualFriends(parent);
                    status(res,"mutual friends updated");
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
                    Sitter.findOne().where('_id', sitterID).exec(function (err, sitter) {
                        if (err) {
                            error(res,err);
                        }
                        else {
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
