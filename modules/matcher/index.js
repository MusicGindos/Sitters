'use strict';

// dependencies

const express = require('express'),
    _ = require('lodash'),
    googleDistance = require('google-distance'),
    dbHandler = require('../dbHandler'),
    reliabilityFilter = require('../reliabilityFilter'),
    scoreSets = require('./scoreSets').scoreSets;

const MAX_DISTANCE = 50;

let getDistance = function (parentAddress, sitterAddress) {  // google-distance is async and we need it to be sync so we use wrapper with flag
    const origin = parentAddress.latitude + ',' + parentAddress.longitude; // compute by latitude and longitude
    const destination = sitterAddress.latitude + ',' + sitterAddress.longitude;  // compute by latitude and longitude
    googleDistance.apiKey = "AIzaSyBwP7ZYyCO86H41nE-E5eHYPCDir9yBpc0";  // google-distance apikey
    googleDistance.get({  // compute distance between 2 locations, can be street-houseNumber-city OR latitude/longitude
            origin: origin,
            destination: destination
        },
        function (err, distance) {
            return  err ? err : Number(distance.distance.split(' ')[0]);
        });
};

let isAgeInRange = function (age, minAge, maxAge) {
    return age >= minAge && age <= maxAge;
};

let isPriceInRange = function (maxPrice, fee) {
    return maxPrice <= fee;
};

let isLocationInRange = function (distance) {
    return distance / 1000 <= MAX_DISTANCE;
};

let isRequiredGender = function (preferedGender, gender) {
    return preferedGender === "both" || preferedGender === gender;
};

let addSitterToBlacklist = function (parent, sitter_id) {
    parent.blacklist.push(sitter_id);
    db.addSitterToBlacklist(parent);
};

let isSpecialNeedsTrained = function (requiredSpecialNeeds, offeredSpecialNeeds) {
    return _.difference(requiredSpecialNeeds, offeredSpecialNeeds).length > 0;
};

let getProximityScore = function (distance) {
    return Math.round(distance <= 5 ? 100 : 100 - ((distance - 5) * 2));
};

let getExperienceScore = function (experience) {
    let experienceScore = 0;
    if (experience >= 4)
        experienceScore = 100;
    else if (experience >= 3)
        experienceScore = 90;
    else if (experience >= 2)
        experienceScore = 75;
    else if (experience >= 1)
        experienceScore = 60;
    return experienceScore;
};

let getHobbiesScore = function (hobbies, offeredHobbies) {
    return _.intersection(hobbies, offeredHobbies).length > 1 ? 100 : 0;
};

let getExpertiseScore = function (expertise, offeredExpertise) {
    return _.intersection(expertise, offeredExpertise).length > 1 ? 100 : 0;
};

let getEducationScore = function (education) {
    let educationScore = 0;
    const isCollege = _.indexOf(education, 'college') !== -1;
    const isHighSchool = _.indexOf(education, 'high school') !== -1;
    if (isHighSchool && isCollege) educationScore = 100;
    else if (isHighSchool || isCollege) educationScore = 50;
    return educationScore;
};

let calculateMatchScores = function (matchData, scoreSetName) {
    let matchScore = 0;
    _.forEach(matchData, criteria => {
        matchScore += (criteria.value *= scoreSets[scoreSetName][criteria.name]);
    });
    matchScore = Math.ceil(matchScore);
    return matchScore;
};

function isMatch(parent, sitter) {
    if (sitter.settings.allowShowOnSearch) {
        sitter.match = computeMatch(parent, sitter);
        sitter.matchScore = sitter.match.matchScore;
        if (sitter.match.matchScore > 50) return true;
    }
    return false;
}

function computeMatch (parent, sitter) {
    let scoreSet = 'default';
    let match = {
        matchScore: 0,
        data: [],
        mutualFriends: 0
    };
    // const distance = await getDistance(parent.address, sitter.address);
    const distance = 5;
    const sitterHasMustHaves = isAgeInRange(parent.children.age, sitter.minAge, sitter.maxAge)
    && isPriceInRange(parent.maxPrice, sitter.hourFee)
    && isLocationInRange(distance)
    && isRequiredGender(parent.preferedGender, sitter.gender)
    && parent.children.specialNeeds ? isSpecialNeedsTrained(parent.children.specialNeeds, sitter.specialNeeds) : true;
    if (!sitterHasMustHaves) {
        addSitterToBlacklist(parent, sitter._id);
        return null;
    }
    const experienceScore = getExperienceScore(sitter.experience);
    const proximityScore = getProximityScore(distance);
    const reliabilityScore = reliabilityFilter.getReliabilityScore(parent, sitter);
    const educationScore = getEducationScore(sitter.education);
    const hobbiesScore = getHobbiesScore(parent.children.hobbies, sitter.hobbies);
    const expertiseScore = getExpertiseScore(parent.children.expertise, sitter.expertise);

    let matchData = [
        {name: 'Experience', value: experienceScore},
        {name: 'Proximity', value: proximityScore},
        {name: 'ReliabilityScore', value: reliabilityScore},
        {name: 'Education', value: educationScore}
    ];

    if (hobbiesScore && expertiseScore) {
        match.data.push({name: 'Hobbies', value: hobbiesScore});
        match.data.push({name: 'Expertise', value: expertiseScore});
        scoreSet = "withExpertiseAndHobbies";
    }
    else if (hobbiesScore) {
        match.data.push({name: 'Hobbies', value: hobbiesScore});
        scoreSet = "withoutExpertise";
    }
    else if (expertiseScore) {
        match.data.push({name: 'Expertise', value: expertiseScore});
        scoreSet = "withoutHobbies";
    }

    if(sitter.multipleInvites.length > 0){
        if(sitter.multipleInvites[0].count >= 5)
            match.matchScore =  match.matchScore + 5 > 100 ? 100: (match.matchScore + 5); // 5% bonus if sitter have 5 invites from 1 parent
    }

    match.matchScore = calculateMatchScores(matchData, scoreSet);
    match.data = _.orderBy(matchData, ['value'], ['desc']);
    match.mutualFriends = reliabilityFilter.getMutualFriends(parent.friends, sitter.friends);

    return match;
};

exports.getMatches = async(req, res) => {
    const sitters = await dbHandler.getSitters();
    if (sitters) {
        const parent = req.body;
        // flatten sitters to key value pairs (id -> sitterDetails)
        const sittersMap = _.keyBy(_.map(sitters, '_doc'), function (sitter) {
            return sitter._id
        });
        // find sitters that are not blacklisted for this parent
        const whitelist = _.filter(sittersMap, sitter => !(_.includes(parent.blacklist, sitter._id)));

        // find matching sitters in whitelist
        const matchingSitters = _.filter(whitelist, sitter => isMatch(parent, sitter));

        // return a descending ordered list of matching sitters
        res.status(200).json(_.orderBy(matchingSitters, ['matchScore'], ['desc']));
    }
    else {
        res.status(404).json("No sitters found");
    }
};

module.exports.computeMatch = computeMatch;