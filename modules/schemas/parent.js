let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Parent;
    extend = require('mongoose-schema-extend');
let base = require('./base.js');
let sitter = require('./sitter.js');

let Child = new Schema({
    allergies:          {type:[String], lowercase: true},
    specialNeeds:       {type:[String], lowercase: true},
    Hobbies:            {type:[String], lowercase: true},
    schoolAddress:      base.Address,
    expertise:          {type:[String], lowercase: true},
    age:                {type:Number,required: true},
    name:               {type:String, required: true}
});

// TODO: fix parent validation - when you send  address object the mongoose fail on Validation, without address its working
let parent = base.User.extend({
    partner: base.User,
    children: Child,
    maxPrice: Number,
    matches: [{
        sitter: sitter.Sitter,
        matchScore: Number
    }]
},{collection:"parents"});

Parent = mongoose.model('Parent', parent);
module.exports = Parent;