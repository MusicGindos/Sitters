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

let Review = new Schema({
    parentID:       {type:Number, required: true},
    sitterID:       {type:Number, required: true},
    date:           {type:Date, required: true, default: Date.now},
    description:    {type:String, required: true},
    rating:         {type:Number, required: true}
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
    rating:          {type: Number, required: true, default: 0},
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
    mobility:        {type: Number, required: true, default: false},
    specialNeeds:    [String],
    expertise:       [String],
    review:          [Review],
    invites:         [Invite]
},{collection:"sitters"},{_id : false});

Sitter = mongoose.model('Sitter', sitter);
module.exports = {sitter: sitter, sitterModel: Sitter};
