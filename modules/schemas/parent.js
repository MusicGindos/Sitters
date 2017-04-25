let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Parent,
    sitter = require('./sitter.js').sitter;

let Address = new Schema({
    city:       String,
    street:     String,
    houseNumber:{type: Number, min: 0},
    latitude:   {type: Number, default: 0},
    longitude:  {type: Number, default: 0}
},{_id : false});

let Hours = new Schema({
    sunday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    monday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    tuesday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    wednesday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    thursday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    friday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    },
    saturday:{
        start:  {type:String, default:"0"},
        finish: {type:String, default:"0"}
    }
},{_id : false});

let Invite = new Schema({
    _id:         {type: String},
    address:    {type:Address, required: true},
    startTime:  {type:String, required: true},
    endTime:    {type:String, required: true},
    date:       {type:String, required: true},
    status:     {type:String, default:"waiting"},
    wasRead: Boolean,
    sitterID:   {type:String, required: true},
    parentID:   {type:String, required: true},
    recurring:  {
        workingHours: Hours,
        until: Date
    },
    notes: String,
    sitterName: String,
    sitterImage: String
});

let Child = new Schema({
    specialNeeds:   {type:[String], lowercase: true},
    hobbies:        {type:[String], lowercase: true},
    expertise:      {type:[String], lowercase: true},
    age:            {type:Number,required: true},
    name:           {type:String, required: true}
},{_id : false});

let notification = new Schema({
    message: String,
    new: Boolean,
    time: Date
},{_id : false});

let Settings = new Schema({
   allowNotification: {type: Boolean, default: true },
   allowSuggestions: {type: Boolean, default: true }
},{_id : false});

let MatchBI = new Schema({
    median: Number,
    matchScores: [Number]
},{_id : false});

let Partner = new Schema({
    email:          {type: String, required: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true}
},{_id : false});

let parent = new Schema({
    _id:            {type: String},
    userType:       {type: String, default: "I'm a parent"},
    email:          {type: String, required: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true},
    profilePicture: String,
    coverPhoto:     String,
    age:            {type:Number,required: true, min: 0},
    languages:      [String],
    timezone:       String,
    partner:        Partner,
    children:       Child,
    maxPrice:       Number,
    notifications: [notification],
    address:        Address,
    invites:        [Invite],
    blacklist:      [String],
    settings:       Settings,
    lastInvite:     Date,
    matchBI:        MatchBI
},{collection:"parents"},{_id : false});

Parent = mongoose.model('Parent', parent);
module.exports = {
    Parent: Parent,
    Notification: notification
};