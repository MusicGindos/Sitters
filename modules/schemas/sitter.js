var mongoose = require('mongoose'),
    schema = mongoose.Schema,
    Sitter;
var base = require('./base.js');

var Review = new schema({
    parentID:       {type:Number, required: true},
    sitterID:       {type:Number, required: true},
    date:           {type:Date, required: true, default: Date.now},
    description:    {type:String, required: true},
    rating:         {type:Number, required: true}
});

var sitter = base.User.extend({
    rating:                      {type: Number, required: true, default: 0},
    education:        	     [String],
    personalityScore: {type: Number, required: true},
    minAge:                  {type: Number, required: true, default: 0},
    maxAge:                 {type: Number, required: true},
    currencyType:      String,
    hourFee:                {type: Number, required: true},
    workingHours:    base.Hours,
    availableNow:      {type: Boolean, required: true},
    experience:           {type: Number, required: true, default: 0},
    hobbies:                 [String],
    mobility:                {type: Number, required: true, default: false},
    specialNeeds:       [String],
    review:                   [Review]
});


exports.Sitter = sitter;
Sitter = mongoose.model('Sitter', sitter);
module.exports = Sitter;