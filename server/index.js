'use strict';

let mongoose = require('../modules/mongoose');

let error = (next, msg, status) => {
    let err = new Error();
    err.status = status;
    err.message = msg;
    next(err);
};
//
// var route = (req, res, next, page) => {
//     fs.readFile(clientRootPath + page, (err, html) => {
//         if (err) {
//             error(next, err.message, 500);
//         }
//         res.write(html);
//         res.end();
//     });
// };


exports.index = (req, res, next) => {
    console.log(req.body);
    //mongoose.insertParent(req,res,next);
        //route(req, res, next, 'index.html');
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

exports.createSitter = (req, res, next) => {
    mongoose.createSitter(req,res,next);
};

exports.updateSitter = (req, res, next) => {
    mongoose.updateSitter(req, res, next);
};

exports.deleteSitter = (req, res, next) => {
    mongoose.deleteSitter(req,res,next);
};

exports.getSitter = (req, res, next) => {
    mongoose.getSitter(req,res,next);
};

exports.createPersonalityTest = (req,res,next) =>{

};