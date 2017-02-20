'use strict';
var mongoose = require('mongoose');
mongoose.connect('mongodb://sitter:123456@ds157499.mlab.com:57499/sitter');

var conn = mongoose.connection;

conn.on('error',function(err){
    return err.message();
});

conn.once('open',function(){

});