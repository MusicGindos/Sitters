let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Sitter,
    extend = require('mongoose-schema-extend'),
    base = require('./base.js');

let Rates = new Schema({
    punctioal: {type: Number, default: 0},
    behavior: {type: Number, default: 0},
    connection: {type: Number, default: 0},
    general: {type: Number, default: 0},
},{_id : false});

let Review = new Schema({
    _id: String,
    parentID:       {type:String, required: true},
    sitterID:       {type:String, required: true},
    parentImage:    {type:String},
    parentName: {type:String},
    date:           {type:Date, required: true, default: Date.now},
    description:    {type:String, required: true},
    rates: Rates
});

let sitter = base.user.extend({
    education:       [String],
    minAge:          {type: Number, required: true, default: 0},
    maxAge:          {type: Number, required: true, default: 12},
    hourFee:         {type: Number, required: true},
    workingHours:    base.hours,
    availableNow:    {type: Boolean, required: true},
    experience:      {type: Number, required: true, default: 0},
    hobbies:         [String],
    mobility:        {type: Boolean, required: true, default: false},
    specialNeeds:    [String],
    expertise:       [String],
    reviews:          [Review],
    lastInvite:     String,
    address:        base.address,
    personalityTest: base.personalityTest,
},{collection:"sitters"},{_id : false});

Sitter = mongoose.model('Sitter', sitter);
module.exports = {sitter: sitter, sitterModel: Sitter};
