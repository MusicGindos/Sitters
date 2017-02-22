let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Sitter,
    base = require('./base.js');
    extend = require('mongoose-schema-extend');

let Review = new Schema({
    parentID:       {type:Number, required: true},
    sitterID:       {type:Number, required: true},
    date:           {type:Date, required: true, default: Date.now},
    description:    {type:String, required: true},
    rating:         {type:Number, required: true}
});

let sitter = base.User.extend({
    address:         base.Address,
    rating:          {type: Number, required: true, default: 0},
    education:       [String],
    personalityScore:Number,
    minAge:          {type: Number, required: true, default: 0},
    maxAge:          {type: Number, required: true, default: 12},
    currencyType:    String,
    hourFee:         {type: Number, required: true},
    workingHours:    base.Hours,
    availableNow:    {type: Boolean, required: true},
    experience:      {type: Number, required: true, default: 0},
    hobbies:         [String],
    mobility:        {type: Number, required: true, default: false},
    specialNeeds:    [String],
    review:          [Review],
    invites:         [base.Invite]
},{collection:"sitters"});

Sitter = mongoose.model('Sitter', sitter);
module.exports = Sitter;
