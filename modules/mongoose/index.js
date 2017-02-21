'use strict';
let mongoose = require('mongoose'),
    Parent = require('../schemas/parent'),
    //sitter = require('../schemas/sitter'),
    db,
    config = {
        mongoUrl:'mongodb://sitter:123456@ds157499.mlab.com:57499/sitter'
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
    console.log('Mongoose: Connection stopped, recconect');
    mongoose.connect(config.mongoUrl, options);
});
db.on('reconnected', function () {
    console.info('Mongoose reconnected!');
});



db.once('open',function(){

});

//Sitter + Parent
exports.getUser = (req,res,next) =>{

};

exports.getInvites = (req,res,next) => {

};

exports.getNotifications = (req,res,next) => {

};

//Parent
exports.insertParent = (req,res,next) =>{

    var parent = new Parent(req.body);
    parent.save(function(err,doc){
        if(err){
            console.log("error");
            console.log(err.message);
        }
    });
    console.log(req.body);
};

exports.updateParent = (req,res,next) =>{

};

exports.deleteParent = (req,res,next) =>{

};

exports.getParent = (req,res,next) =>{

};

exports.sendInvite = (req,res,next) =>{
 // TODO: insert into parent + sitter db
};

exports.writeReview = (req,res,next) =>{
//TODO: insert into sitter db only
};

//Sitter
exports.insertSitter = (req,res,next) =>{
//TODO: update all parents matches
};

exports.updateSitter = (req,res,next) =>{
//TODO: update all parents matches
};

exports.deleteSitter = (req,res,next) =>{
//TODO: update all parents matches
};

exports.getSitter = (req,res,next) =>{

};

//