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

let Settings = new Schema({
    allowNotification: {type: Boolean, default: true},
    allowShowOnSearch: {type:Boolean, default: true}
},{_id : false});

let address = new Schema({
    city:       String,
    street:     String,
    houseNumber:{type: Number, min: 0},
    latitude:   {type: Number, default: 0},
    longitude:  {type: Number, default: 0}
},{_id : false});

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
    address:        address,
    personalityTest: base.personalityTest,
    settings:       Settings
},{collection:"sitters"});

Sitter = mongoose.model('Sitter', sitter);
module.exports = {sitter: sitter, sitterModel: Sitter};
