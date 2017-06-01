'use strict';

let express = require('express'),
    fs = require('fs'),
    _ = require('lodash'),
    googleDistance = require('google-distance'),
    finish = true,
    maindata = null,
    origin = null,
    destination = null,
    distance = null,
    generalScore = 0,
    proximityScore = null,
    experienceScore = null,
    sameHobbies = 0,
    sameExpertise = null,
    collegeScore = 0,
    highSchoolScore = 0,
    personalityScore = 0,
    matchData = [],
    db = require('../mongoose'),
    mutualFriends = [];

let init = function () {
    finish = true,
        maindata = origin = destination = distance = proximityScore = experienceScore = sameExpertise = null,
        sameHobbies = generalScore = collegeScore = highSchoolScore = personalityScore = 0, matchData = [], mutualFriends = [];
};
let scoreSet = {
    default: {
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.35,
        college: 0.05,
        highSchool: 0.05
    },
    withoutExpertise: {
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.25,
        college: 0.05,
        highSchool: 0.05,
        hobbies: 0.1
    },
    withoutHobbies: {
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.25,
        college: 0.05,
        highSchool: 0.05,
        expertise: 0.1
    },
    withExpertiseAndHobbies: {
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.25,
        college: 0.05,
        highSchool: 0.05,
        hobbies: 0.05,
        expertise: 0.05
    },
};

let computeSync = function (origin, destination, callback) {  // google-distance is async and we need it to be sync so we use wrapper with flag
    googleDistance.apiKey = "AIzaSyBwP7ZYyCO86H41nE-E5eHYPCDir9yBpc0";  // google-distance apikey for make more calls
    googleDistance.get({  // compute distance between 2 locations, can be street-houseNumber-city OR latitude/longitude
            origin: origin,
            destination: destination
        },
        function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            maindata = data;
            finish = false; // exit the sync loop
            callback(data);
        });
};

let computeDistance = function (origin, destination) { // make compute distance sync with flag and while loop
    computeSync(origin, destination, function (result) {
        maindata = result;
    });
    while (finish) {
        require('deasync').sleep(100); // sync for google-distance api
    }
    finish = true; // for next sync call
    return maindata;
};

let computeMatchScore = function (parent, sitter, filter, distance) {  // make compute score sync with flag and while loop
    if (parent.address.latitude != 0 && parent.address.longitude != 0) {  // compute by latitude and longitude
        origin = parent.address.latitude + ',' + parent.address.longitude
    }
    else { //compute by address
        origin = parent.address.street + ' ' + parent.address.houseNumber + ' ' + parent.address.city;
    }
    if (sitter.address.latitude != 0 && sitter.address.longitude != 0) {// compute by latitude and longitude
        destination = sitter.address.latitude + ',' + sitter.address.longitude
    }
    else { //compute by address
        destination = sitter.address.street + ' ' + sitter.address.houseNumber + ' ' + sitter.address.city;
    }

    distance = computeDistance(origin, destination);
    computeScore(parent, sitter, filter, distance, function (result) {
        maindata = result;
    });
    while (finish) {
        require('deasync').sleep(100);
    }
    finish = true; // for next sync call
    return maindata;
};


let computeScore = function (parent, sitter, filter, distance, callback) { // compute match score between sitter-parent-child
    init();
    if (parent.children.age < sitter.minAge || parent.children.age > sitter.maxAge || sitter.hourFee > parent.maxPrice) {
        parent.blacklist.push(sitter._id);
        db.addSitterToBlacklist(parent);
        finish = false;
        callback(0);
        return;
    }
    else if (((distance.distanceValue / 1000) > 50 ) || (parent.preferedGender !== "both" && parent.preferedGender !== sitter.gender)) {
        parent.blacklist.push(sitter._id);
        db.addSitterToBlacklist(parent);
        finish = false;
        callback(0);
        return;
    }
    if (typeof parent.children.specialNeeds !== "undefined") {
        for (let i = 0, len = parent.children.specialNeeds.length; i < len; i++) {
            if (_.indexOf(sitter.specialNeeds, parent.children.specialNeeds[i]) == -1) {
                finish = false;
                callback(0);
                return;
            }
            // sitter don't have the specialNeed that the child need and the match score is 0
        }
    }

    //proximity score
    distance = distance.distance.split(' ');
    distance = Number(distance[0]);  // distance between 2 locations with google-distance
    if (distance <= 5)   // calculate location score
        proximityScore = 100;
    else {
        proximityScore = 100 - ((distance - 5) * 2); //for each added 1 km more than 5, reduce 2
    }
    if (proximityScore < 0)  // if the sitter is more than 50 kilometer from thr child address
        proximityScore = 0;
    matchData.push({name: 'Proximity', value: Math.round(proximityScore)});

    //experience score
    if (sitter.experience >= 4)  // calculate experience by years
        experienceScore = 100;
    else if (sitter.experience >= 3)
        experienceScore = 90;
    else if (sitter.experience >= 2)
        experienceScore = 75;
    else if (sitter.experience >= 1)
        experienceScore = 60;
    else if (sitter.experience >= 0)
        experienceScore = 0;
    matchData.push({name: 'Experience', value: Math.round(experienceScore)});

    //hobbies score
    if (typeof parent.children.hobbies !== "undefined" && parent.children.hobbies.length > 0 && sitter.hobbies.length > 0) {  // calculate hobbies match of the sitter with child
        _.forEach(parent.children.hobbies, function (hobbie) {
            if (_.indexOf(sitter.hobbies, hobbie) > -1) { // check if sitter have the hobbie
                sameHobbies++;
            }
        });
    }
    else {
        sameHobbies = -1;  // children don't have any hobbies
    }

    //expertise score
    if (typeof parent.children.expertise !== "undefined" && parent.children.expertise.length > 0 && sitter.expertise.length > 0) {
        _.forEach(parent.children.expertise, function (exp) {
            if (_.indexOf(sitter.expertise, exp) > -1) { // check if sitter have the expertise
                sameExpertise++;
            }
        });
    }
    else {
        sameExpertise = -1;  // children don't have any expertise
    }
    if (sitter.mobility)
        generalScore += 5;

    if (_.indexOf(sitter.education, 'college') !== -1) {
        collegeScore = 5;
        generalScore += 5;
    }
    if (_.indexOf(sitter.education, 'highSchool') !== -1) {
        highSchoolScore = 5;
        generalScore += 5;
        matchData.push({name: 'Education', value: 100});
    }
    else {
        matchData.push({name: 'Education', value: 50});
    }

    if(sitter.reviews.length > 0 ){ // reviews
        personalityScore += ( 10 * sitter.reviews.length);
    }
    if (sitter.friends.length > 0 && parent.friends.length > 0) {
        mutualFriends = _.intersectionBy(parent.friends,sitter.friends, "id")
        //let mutualFriendsScore = (mutualFriends.length * 2) > 10 ? 10 : mutualFriends.length * 2;
        if (mutualFriends.length !== 0) {
            if (mutualFriends.length > 2) {
                personalityScore += ( 50 + ( 10 * (mutualFriends.length - 2)));
            }
            else {
                personalityScore += mutualFriends.length === 2 ?50 :30;
            }

        }
    }
    let samePersonalityWords = _.intersection(parent.personality, sitter.personality);
    if(samePersonalityWords.length > 0){
        const wordsCount = samePersonalityWords.length;
        if(wordsCount > 2){
            personalityScore += (25 + ((wordsCount - 2) * 20));
        }
        else{
            personalityScore += wordsCount === 2? 25: 10;
        }
    }
    if(personalityScore > 100)
        personalityScore = 100;
    matchData.push({name: 'Personality', value: Math.round(personalityScore)});
    // if(samePersonalityWords.length === 0 && mutualFriends.length === 0){TODO: enable after will 30 sitters in db
    //     parent.blacklist.push(sitter._id);
    //     db.addSitterToBlacklist(parent);
    //     finish = false;
    //     callback(0);
    //     return;
    // }
    if (sameHobbies > 0) {
        if (sameExpertise > 0) { // hobbies and expertise score set
            if (sameHobbies > 1) {
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 100;
                matchData.push({name: 'Hobbies', value: 100});
            }
            else {
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 50;
                matchData.push({name: 'Hobbies', value: 50});
            }
            if (sameExpertise > 1) {
                generalScore += scoreSet.withExpertiseAndHobbies.expertise * 100;
                matchData.push({name: 'Expertise', value: 100});
            }
            else {
                generalScore += scoreSet.withExpertiseAndHobbies.expertise * 50;
                matchData.push({name: 'Expertise', value: 50});
            }
            generalScore += scoreSet.withExpertiseAndHobbies.college * collegeScore;
            generalScore += scoreSet.withExpertiseAndHobbies.experience * experienceScore;
            generalScore += scoreSet.withExpertiseAndHobbies.highSchool * highSchoolScore;
            generalScore += scoreSet.withExpertiseAndHobbies.proximity * proximityScore;
            generalScore += scoreSet.withExpertiseAndHobbies.personalityTest * personalityScore;
        }
        else { // hobbies score set
            if (sameHobbies > 1) {
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 100;
                matchData.push({name: 'Hobbies', value: 100});
            }
            else {
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 50;
                matchData.push({name: 'Hobbies', value: 50});
            }
            generalScore += scoreSet.withoutExpertise.college * collegeScore;
            generalScore += scoreSet.withoutExpertise.experience * experienceScore;
            generalScore += scoreSet.withoutExpertise.highSchool * highSchoolScore;
            generalScore += scoreSet.withoutExpertise.proximity * proximityScore;
            generalScore += scoreSet.withoutExpertise.personalityTest * personalityScore;
        }
    }
    else if (sameExpertise > 0) {// expertise score set
        if (sameExpertise > 1) {
            generalScore += scoreSet.withExpertiseAndHobbies.expertise * 100;
            matchData.push({name: 'Expertise', value: 100});
        }
        else {
            generalScore += scoreSet.withExpertiseAndHobbies.expertise * 50;
            matchData.push({name: 'Expertise', value: 50});
        }
        generalScore += scoreSet.withoutHobbies.college * collegeScore;
        generalScore += scoreSet.withoutHobbies.experience * experienceScore;
        generalScore += scoreSet.withoutExpertise.highSchool * highSchoolScore;
        generalScore += scoreSet.withoutHobbies.proximity * proximityScore;
        generalScore += scoreSet.withoutHobbies.personalityTest * personalityScore;
    }
    else { // default score set
        generalScore += scoreSet.default.college * collegeScore;
        generalScore += scoreSet.default.experience * experienceScore;
        generalScore += scoreSet.default.highSchool * highSchoolScore;
        generalScore += scoreSet.default.proximity * proximityScore;
        generalScore += scoreSet.default.personalityTest * personalityScore;
    }
    if (generalScore > 100) // more than 100% match with the bonuses
        generalScore = 100;
    else {
        if(sitter.multipleInvites.length > 0){
            if(sitter.multipleInvites[0].count >= 5)
                generalScore = generalScore + 5 > 100 ? 100: (generalScore + 5); // 5% bonus if sitter have 5 invites from 1 parent
        }
    }
    finish = false;  // exit the sync loop
    let match = {};
    match.matchScore = Math.ceil(generalScore);
    match.data = _.orderBy(matchData, ['value'], ['desc']);
    match.mutualFriends = mutualFriends;
    callback(match);
};

exports.calculateMatchingScore = function (parent, sitter) {
    //sitter.address = sitter.address._doc;
    let match = computeMatchScore(parent, sitter, null, distance);
    if (match.matchScore === 0) {
        return {"matchScore": 0};  // no match
    }
    else {
        return match;
    }
};