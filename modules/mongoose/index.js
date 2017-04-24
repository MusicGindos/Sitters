'use strict';
let mongoose = require('mongoose'),
    Parent = require('../schemas/parent').Parent,
    Sitter = require('../schemas/sitter').sitterModel,
    base = require('../schemas/base'),
    db,
    clone = require('clone'),
    matcher = require('./../matcher'),
    config = {
        mongoUrl:'mongodb://sitter:123456@ds157499.mlab.com:57499/sitter'
    };

let error = (res,error) => {
    console.log(error.message);
    res.status(400).json({
        'error': error.message
    });
};

let status = (res,status) =>{
    res.status(200).json({'status':status});
};

console.log('connection');

//The server option auto_reconnect is defaulted to true
let options = {
    server: {
        auto_reconnect:true,
    }
};
mongoose.connect(config.mongoUrl, options);
db = mongoose.connection;// a global connection variable

// Event handlers for Mongoose
db.on('error', function (err) {
    console.log('Mongoose: Error: ' + err);
});
db.on('open', function() {
    console.log('Mongoose: Connection established');
});
db.on('disconnected', function() {
    console.log('Mongoose: Connection stopped, reconnect');
    mongoose.connect(config.mongoUrl, options);
});
db.on('reconnected', function () {
    console.info('Mongoose reconnected!');
});

db.once('open',function(){ // if needed to do action once got connection

});


//Parent
exports.createParent = (req,res) =>{
    let parent = new Parent(req.body);
    parent.save(function(err){
        if(err){
            error(res,err);
        }
        else{
            status(res,req.body.email + " created");
        }
    });
};

exports.updateParent = (req,res) =>{
    Parent.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.update({$set: req.body}).exec(function (err){
            if (err) {
                error(res,err);
            }
            else {
                status(res,req.body.email + " updated");
            }
        });
    });
};

exports.deleteParent = (req,res) =>{
    Parent.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.remove(function (err) {
            if (err){
                error(res,err);
            }
            else {
                status(res,req.body.email + " deleted");
            }
        });
    });
};


function calculateMatches(parent,sitters){
    let sittersResult = [];
    let tempSitter = {} ;
    let index = 0;
    let sitter0 = {};
    let sitter1 = {};
    let sitter2 = {};
    let sitter3 = {};
    let sitter4 = {};

    let s = [];
    sitters.forEach(function(sitter){
        s.push(sitter._doc);
    });
    for(let index = 0; index < s.length; index++){
        //let match = matcher.calculateMatchingScore(parent, s[index]);
        if(index === 0){
            sitter0 = s[index];
            sitter0['match'] =  clone(matcher.calculateMatchingScore(parent, s[index]));
        }
        else if(index === 1){
            sitter1 = s[index];
            sitter1['match'] = clone(matcher.calculateMatchingScore(parent, s[index]));
        }
        else if(index === 2){
            sitter2 = s[index];
            sitter2['match'] = clone(matcher.calculateMatchingScore(parent, s[index]));
        }
        else if(index === 3){
            sitter3 = s[index];
            sitter3['match'] = clone(matcher.calculateMatchingScore(parent, s[index]));
        }
        else if(index === 4){
            sitter4 = s[index];
            sitter4['match'] = clone(matcher.calculateMatchingScore(parent, s[index]));
        }

        // s[index]['match'] = match;
        // console.log(s[index]);
        // if(tempSitter.match.matchScore > 0) {
        //     sittersResult[index] = tempSitter;
        // }
        // tempSitter = {};
    }
    console.log(sitter0['match']);
    console.log(sitter1['match']);
    console.log(sitter2['match']);
    console.log(sitter3['match']);
    console.log(sitter4['match']);
    // sitters.forEach(function(sitter){
    //     tempSitter = sitter._doc;
    //     tempSitter.match = matcher.calculateMatchingScore(parent, tempSitter);
    //     if(tempSitter.match.matchScore > 0){
    //         sittersResult[index] = tempSitter;
    //         index ++;
    //         sittersResult.push(tempSitter);
    //         tempSitter = {};
    //     }
    // });
    sittersResult[0] = sitter0;
    sittersResult[1] = sitter1;
    sittersResult[2] = sitter2;
    sittersResult[3] = sitter3;
    sittersResult[4] = sitter4;
    return sittersResult;
}

function isMatch(parent, sitter) {
    sitter.match = clone(matcher.calculateMatchingScore(parent, sitter));
    // sitter.locationScore = matcher.calculateMatchingScore(parent, sitter).locationScore;
    if(sitter.match.matchScore > 0) return sitter.match;
}



exports.getMatches = (req,res) =>{
    Sitter.find(function (err, sitters) {
        if (err){
            error(res,err);
        }
        else {
            const parent = req.body;
            res.status(200).json(sitters.filter(sitter => isMatch(parent, sitter._doc)));
            // res.status(200).json(calculateMatches(parent,sitters));
        }
    });
};

exports.getParent = (req,res) =>{
    Parent.findOne().where('_id', req.body.id).exec(function (err, doc) {
        if (err){
            error(res,err);
        }
        else {
            res.status(200).json(doc);
        }
    });
};

//Sitter
exports.createSitter = (req,res) =>{
    let sitter = new Sitter(req.body);
    sitter.save(function(err){
        if(err){
            error(res,err);
        }
        else{
            status(res,req.body.email + " created");
        }
    });
};

exports.updateSitter = (req,res) =>{
    Sitter.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.update({$set: req.body}).exec(function (err){
            if (err) {
                error(res,err);
            }
            else {
                status(res,req.body.email + " updated");
            }
        });
    });
};

exports.deleteSitter = (req,res) =>{
    Sitter.findOne().where('_id', req.body._id).exec(function (err, doc) {
        doc.remove(function (err) {
            if (err){
                error(res,err);
            }
            else {
                status(res,req.body.email + " deleted");
            }
        });
    });
};

exports.getSitter = (req,res) =>{
    Sitter.findOne().where('_id', req.body._id).exec(function (err, doc) {
        if (err){
            error(res,err);
        }
        else {
            res.status(200).json(doc);
        }
    });
};

exports.getSitters = (req,res) =>{
    Sitter.find(function (err, sitters) {
        if (err){
            error(res,err);
        }
        else {
            res.status(200).json(sitters);
        }
    });
};

exports.getUser = (req,res) =>{
    Parent.findOne().where('_id', req.body._id).exec(function (err, parent) {
        if (err || err === null) {
            //error(res,err);
            Sitter.findOne().where('_id', req.body._id).exec(function (err, sitter) {
                if (err || err === null) { // the user doesn't exists
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

exports.sendInvite = (req,res,next) =>{
    Parent.findOne().where('_id', req.body.parentID).exec(function (err, parent) {
        if (err) {
            error(res,err);
        }
        else {
            parent._doc.invites.push(req.body);
            //console.log(parent);
            // res.status(200).json(parent);
            parent.update({$set: parent}).exec(function (err){
                if (err) {
                    error(res,err);
                }
                else {
                    //status(res,"invite created");
                    Sitter.findOne().where('_id', req.body.sitterID).exec(function (err, sitter) {
                        if (err) {
                            error(res,err);
                        }
                        else {
                            sitter._doc.invites.push(req.body);
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
