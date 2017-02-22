'use strict';
let mongoose = require('mongoose'),
    Parent = require('../schemas/parent'),
    Sitter = require('../schemas/sitter'),
    db,
    config = {
        mongoUrl:'mongodb://sitter:123456@ds157499.mlab.com:57499/sitter'
    };

let error = (res,error) => {
    res.status(400).json({
        "error": error.message
    });
};

let status = (res,status) =>{
    res.status(200).json({'status':status});
}

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

exports.getParent = (req,res) =>{
    Parent.findOne().where('_id', req.body._id).exec(function (err, doc) {
        if (err){
            error(res,err);
        }
        else {
            res.status(200).json(doc);
        }
    });
};

exports.sendInvite = (req,res,next) =>{
 // TODO: insert into parent + sitter db
};

exports.writeReview = (req,res,next) =>{
//TODO: insert into sitter db only
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
