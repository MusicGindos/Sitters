let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Parent,
    extend = require('mongoose-schema-extend'),
    base = require('./base.js');
// user = require('./base.js').user;

let Settings = new Schema({
    allowNotification: {type: Boolean, default: true},
    allowSuggestions: {type: Boolean, default: true}
}, {_id: false});

let Partner = new Schema({
    email: {type: String, required: true},
    name: {type: String, required: true},
    joinedTime: {type: Date, default: Date.now},
    gender: {type: String, required: true}
}, {_id: false});

let Child = new Schema({
    specialNeeds: {type: [String], lowercase: true},
    hobbies: {type: [String], lowercase: true},
    expertise: {type: [String], lowercase: true},
    age: {type: Number, required: true},
    name: {type: String, required: true}
}, {_id: false});

let PushNotifications = new Schema({
    endpoint: String,
    keys: {
        auth: String,
        p256dh: String
    }
}, {_id: false});

let parent = base.user.extend({
    address: base.address,
    partner: Partner,
    children: Child,
    maxPrice: Number,
    blacklist: [String],
    settings: Settings,
    preferedGender: String,
    pushNotifications: PushNotifications
}, {collection: "parents"}, {_id: false});
Parent = mongoose.model('Parent', parent);
module.exports = {
    Parent: Parent,
    Notification: base.notification
};