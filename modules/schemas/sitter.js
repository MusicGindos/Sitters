let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Sitter;

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

let Review = new Schema({
    parentID:       {type:String, required: true},
    sitterID:       {type:String, required: true},
    parentImage:    {type:String},
    date:           {type:Date, required: true, default: Date.now},
    description:    {type:String, required: true},
    rating:         {type:Number}
},{_id : false});

let Question = new Schema({
    start: String,
    end: String,
    value: Number
},{_id : false});

let PersonalityTest = new Schema({
    questions: [Question],
    totalScore: Number
},{_id : false});

let sitter = new Schema({
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
    address:         Address,
    education:       [String],
    personalityScore:Number,
    minAge:          {type: Number, required: true, default: 0},
    maxAge:          {type: Number, required: true, default: 12},
    currencyType:    String,
    hourFee:         {type: Number, required: true},
    workingHours:    Hours,
    availableNow:    {type: Boolean, required: true},
    experience:      {type: Number, required: true, default: 0},
    hobbies:         [String],
    mobility:        {type: Boolean, required: true, default: false},
    specialNeeds:    [String],
    expertise:       [String],
    reviews:          [Review],
    invites:         [Invite],
    lastInvite:     String,
    personalityTest: PersonalityTest
},{collection:"sitters"},{_id : false});

Sitter = mongoose.model('Sitter', sitter);
module.exports = {sitter: sitter, sitterModel: Sitter};
