let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let Address = new Schema({
    city: String,
    street: String,
    houseNumber: {type: Number, min: 0},
    latitude:  {type: Number, default: 0},
    longitude: {type: Number, default: 0}
});

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
});

let Invite = new Schema({
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

let User = new Schema({
    id:             {type: Number, required: true, unique: true},
    email:          {type: String, required: true, unique: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true},
    profilePicture: String,
    coverPhoto:     String,
    age:            {type:Number,required: true, min: 0},
    location:       String,
    address:        Address,
    languages:      [String],
    timezone:       String,
    invites:        [Invite]
});

module.exports = {
    Address: Address,
    User: User,
    Hours: Hours,
    Invite: Invite
};