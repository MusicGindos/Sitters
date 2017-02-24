let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Parent,
    extend = require('mongoose-schema-extend'),
    base = require('./base.js'),
    sitter = require('./sitter.js');

let Child = new Schema({
    allergies:      {type:[String], lowercase: true},
    specialNeeds:   {type:[String], lowercase: true},
    Hobbies:        {type:[String], lowercase: true},
    schoolAddress:  base.Address,
    expertise:      {type:[String], lowercase: true},
    age:            {type:Number,required: true},
    name:           {type:String, required: true}
});

let notification = new Schema({
    message: String,
    new: Boolean,
    time: Date
});

let parent = base.User.extend({
    partner:        base.User,
    children:       Child,
    maxPrice:       Number,
    notifications: [notification],
    matches: [{
        sitter:     sitter.Sitter, //TODO: fix this
        matchScore: Number
    }],
    address:        base.Address,
    invites:        [base.Invite]
},{collection:"parents",_id : false});

Parent = mongoose.model('Parent', parent);
module.exports = {
    Parent: Parent,
    Notification: notification
};