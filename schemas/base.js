let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User;

let address = new Schema({
    city: String,
    street: String,
    houseNumber: {type: Number, min: 0},
    latitude: {type: Number, default: 0},
    longitude: {type: Number, default: 0}
}, {_id: false});

let hours = new Schema({
    sunday: [String],
    monday: [String],
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String],
    saturday: [String],
}, {_id: false});

let invite = new Schema({
    _id: {type: String},
    address: {type: address, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
    date: {type: String, required: true},
    status: {type: String, default: "waiting"},
    wasRead: Boolean,
    sitterID: {type: String, required: true},
    parentID: {type: String, required: true},
    notes: String,
    sitterName: String,
    sitterImage: String,
    parentImage: String,
    parentName: String,
    childName: String,
});

let notification = new Schema({
    _id: {type: String},
    message: String,
    wasRead: Boolean,
    date: Date,
    sitterName: String,
    sitterID: String,
    sitterImage: String,
    sitterCover: String,
    matchScore: Number,
    sitter: {
        sitterName: String,
        profilePicture: String,
        coverPhoto: String,
        personality: Object
    },
    match: Object
});

let friend = new Schema({
    name: String,
    id: String,
    picture: {type: String, default: ''}
}, {_id: false});

let user = new Schema({
    _id: {type: String},
    email: {type: String, required: true},
    name: {type: String, required: true},
    joinedTime: {type: Date, default: Date.now},
    gender: {type: String, required: true},
    profilePicture: String,
    coverPhoto: String,
    age: {type: Number, required: true, min: 0},
    languages: [String],
    notifications: [notification],
    invites: [invite],
    friends: [friend],
    personality: [String],
    isParent: Boolean,
    senderGCM: {
        senderId: String,
        valid: {type: Boolean, default: false}
    }
});
User = mongoose.model('User', user);

module.exports = {
    address: address,
    invite: invite,
    hours: hours,
    notification: notification,
    friend: friend,
    user: user
};