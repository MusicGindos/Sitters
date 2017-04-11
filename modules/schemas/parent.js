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
    _id:            {type: mongoose.Schema.ObjectId, default: mongoose.Types.ObjectId},
    address:    {type:Address, required: true},
    startTime:  {type:Date, required: true},
    endTime:    {type:Date, required: true},
    date:       {type:Date, required: true},
    status:     {type:String, default:"waiting"},
    recurring:  {
        workingHours: Hours,
        until: Date
    },
    sitterID:   {type:Number, required: true},
    parentID:   {type:Number, required: true}
});

let Child = new Schema({
    allergies:      {type:[String], lowercase: true},
    specialNeeds:   {type:[String], lowercase: true},
    hobbies:        {type:[String], lowercase: true},
    schoolAddress:  Address,
    expertise:      {type:[String], lowercase: true},
    age:            {type:Number,required: true},
    name:           {type:String, required: true}
},{_id : false});

let notification = new Schema({
    message: String,
    new: Boolean,
    time: Date
},{_id : false});

let Partner = new Schema({
    email:          {type: String, required: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true}
},{_id : false});

let parent = new Schema({
    _id:            {type: String},
    email:          {type: String, required: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true},
    profilePicture: String,
    coverPhoto:     String,
    age:            {type:Number,required: true, min: 0},
    location:       String,
    languages:      [String],
    timezone:       String,
    partner:        Partner,
    children:       Child,
    maxPrice:       Number,
    notifications: [notification],
    matches: [{
        sitter:     sitter, //TODO: fix this
        matchScore: Number
    }],
    address:        Address,
    invites:        [Invite]
},{collection:"parents"},{_id : false});

Parent = mongoose.model('Parent', parent);
module.exports = {
    Parent: Parent,
    Notification: notification
};