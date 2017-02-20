var mongoose = require('mongoose'),
    schema = mongoose.Schema,
    Parent;
var base = require('./base.js');
var sitter = require('./sitter.js');

var Child = new schema({
    allergies:          {type:[String], lowercase: true},
    specialNeeds:       {type:[String], lowercase: true},
    Hobbies:            {type:[String], lowercase: true},
    schoolAddress:      base.Address,
    expertise:          {type:[String], lowercase: true},
    age:                {type:Number,required: true},
    name:               {type:String, required: true}
});


var parent = base.User.extend({
    partner: User,
    children: Child,
    maxPrice: Number,
    matches: [{
        sitter: sitter.Sitter,
        matchScore: Number
    }]
});





Parent = mongoose.model('Parent', parent);
module.exports = Parent;