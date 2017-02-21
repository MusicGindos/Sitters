'use strict';

let mongoose = require('../modules/mongoose');

let error = (next, msg, status) => {
    let err = new Error();
    err.status = status;
    err.message = msg;
    next(err);
};

var route = (req, res, next, page) => {
    // fs.readFile(clientRootPath + page, (err, html) => {
    //     if (err) {
    //         error(next, err.message, 500);
    //     }
    //     res.write(html);
    //     res.end();
    // });
};


exports.index = (req, res, next) => {
    console.log(req.body);
    //mongoose.insertParent(req,res,next);
        //route(req, res, next, 'index.html');
};

exports.test = (req,res,next) =>{
  //console.log(req.body);
  mongoose.insertParent(req,res,next);
};


exports.createPersonalityTest = (req,res,next) =>{

};