let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User;
// Address, Hours, Invite, Question, PersonalityTest, Notification, MatchBI, Friend, User;

let address = new Schema({
    city:       String,
    street:     String,
    houseNumber:{type: Number, min: 0},
    latitude:   {type: Number, default: 0},
    longitude:  {type: Number, default: 0}
},{_id : false});

let hours = new Schema({
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

let invite = new Schema({
    _id:         {type: String},
    address:    {type:address, required: true},
    startTime:  {type:String, required: true},
    endTime:    {type:String, required: true},
    date:       {type:String, required: true},
    status:     {type:String, default:"waiting"},
    wasRead: Boolean,
    sitterID:   {type:String, required: true},
    parentID:   {type:String, required: true},
    recurring:  {
        workingHours: hours,
        until: Date
    },
    notes: String,
    sitterName: String,
    sitterImage: String
});

let question = new Schema({
    label1: String,
    label2: String,
    value: Number
},{_id : false});

let personalityTest = new Schema({
    questions: [question],
    totalScore: Number
},{_id : false});



let notification = new Schema({
    message: String,
    new: Boolean,
    time: Date
},{_id : false});

let matchBI = new Schema({
    median: Number,
    matchScores: [Number]
},{_id : false});

let friend = new Schema({
    name: String,
    id: String
},{_id : false});


let user = new Schema({
    _id:            {type: String},
    userType:       {type: String, default: "I'm a parent"},
    email:          {type: String, required: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true},
    currencyType:    String,
    profilePicture: String,
    coverPhoto:     String,
    age:            {type:Number,required: true, min: 0},
    languages:      [String],
    timezone:       String,
    notifications: [notification],
    address:        address,
    invites:        [invite],
    personalityTest: personalityTest,
    mutualFriends: [friend],
});
User = mongoose.model('User', user);

module.exports = {address: address,
    invite: invite,
    hours: hours,
    question: question,
    personalityTest: personalityTest,
    notification: notification,
    matchBI: matchBI,
    friend: friend,
    user: user};
