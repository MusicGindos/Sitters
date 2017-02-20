var mongoose = require('mongoose'),
    schema = mongoose.Schema;

var address = new schema({
    city:		 String,
    street:      String,
    houseNumber: {type:Number, min:0},
    latitude:    {type:Number, default:0},
    longitude:   {type:Number, default:0}
});

var hours = new schema({
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

var invite = new schema({
    address:    {type:address, required: true},
    startTime:  {type:Date, required: true},
    endTime:    {type:Date, required: true},
    date:       {type:Date, required: true},
    status:     {type:String, default:"waiting"},
    recurring:  {
        workingHours: hours,
        until: Date
    },
    sitterID:   {type:Number, required: true},
    parentID:   {type:Number, required: true}
});

var user = new schema({
    id:             {type: Number, required: true, unique: true},
    email:          {type: String, required: true, unique: true},
    name :          {type:String, required: true},
    joinedTime:     {type: Date, default: Date.now},
    gender:         {type:String, required: true},
    profilePicture: String,
    coverPhoto:     String,
    age:            {type:Number,required: true, min: 0},
    location:       String,
    address:        {type:address,required: true},
    languages:      [String],
    timezone:       String,
    invites:        [invite]
});


exports.Address = address;
exports.Hours = hours;
exports.Invite = invite;
exports.User = user;

