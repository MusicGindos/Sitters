'use strict';

let express		    = require('express'),
    fs			    = require('fs'),
    _               = require('lodash'),
    localJSONPath   = "data/data.json",
    jsonfile        = require('jsonfile'),
    googleDistance  = require('google-distance'),
    finish          = true,
    maindata        = null,
    data            = null,
    origin          = null,
    destination     = null,
    distance        = null,
    matchScore      = null,
    generalScore    = 0,
    locationScore   = null,
    experienceScore = null,
    hobbiesScore    = null,
    knowledgeScore  = null,
    bonusScore      = 5,
    score           = 0,
    divide          = 0,
    tempScore       = 0,
    matchData       = {},
    personalityCategoryScore = 0.3,
    normalCategoryScore = 0.7;

let computeSync = function(origin,destination,callback){  // google-distance is async and we need it to be sync so we use wrapper with flag
    googleDistance.apiKey = "AIzaSyBwP7ZYyCO86H41nE-E5eHYPCDir9yBpc0";  // google-distance apikey for make more calls
    googleDistance.get({  // compute distance between 2 locations, can be street-houseNumber-city OR latitude/longitude
            origin: origin,
            destination: destination
        },
        function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            maindata = data;
            finish = false; // exit the sync loop
            callback(data);
        });
};

let computeDistance = function(origin,destination) { // make compute distance sync with flag and while loop
    computeSync(origin,destination, function(result){
        maindata = result;
    });
    while(finish) {
        require('deasync').sleep(100); // sync for google-distance api
    }
    finish = true; // for next sync call
    return maindata;
};

let computeMatchScore = function(parent,sitter,filter,distance) {  // make compute score sync with flag and while loop
    if(parent.address.latitude != 0 && parent.address.longitude != 0){  // compute by latitude and longitude
        origin = parent.address.latitude + ',' + parent.address.longitude
    }
    else{ //compute by address
        origin = parent.address.street + ' ' + parent.address.houseNumber + ' ' + parent.address.city;
    }
    if(sitter.address.latitude != 0 && sitter.address.longitude != 0){// compute by latitude and longitude
        destination = sitter.address.latitude + ',' + sitter.address.longitude
    }
    else{ //compute by address
        destination = sitter.address.street + ' ' + sitter.address.houseNumber + ' ' + sitter.address.city;
    }

    distance = computeDistance(origin,destination);
    computeScore(parent,sitter,filter,distance, function(result){
        maindata = result;
    });
    while(finish) {
        require('deasync').sleep(100);
    }
    finish = true; // for next sync call
    return maindata;
};

let computeScore = function(parent,sitter,filter,distance,callback){ // compute match score between sitter-parent-child
    if(parent.children.age < sitter.minAge || parent.children.age > sitter.maxAge || sitter.hourFee > parent.maxPrice){
        finish = false;
        callback(0);
        return;
    }
    if(typeof parent.children.specialNeeds !== "undefined"){
        for (let i = 0, len = parent.children.specialNeeds.length; i < len; i++) {
            if (_.indexOf(sitter.specialNeeds, parent.children.specialNeeds[i]) == -1){
                finish = false;
                callback(0);
                return;
            }
            // sitter don't have the specialNeed that the child need and the match score is 0
        }
    }
    distance = distance.distance.split(' ');
    distance = Number(distance[0]);  // distance between 2 locations with google-distance
    if(distance <= 5)   // calculate location score
        locationScore = 100;
    else{
        locationScore = 100 - ((distance-5) * 2); //for each added 1 km more than 5, reduce 2
    }
    if(locationScore < 0)  // if the sitter is more than 50 kilometer from thr child address
        locationScore = 0;
    matchData.location = { label: 'Location', value: Math.round(locationScore)}; // send data to client
    if(sitter.experience >= 4)  // calculate experience by years
        experienceScore = 100;
    else if(sitter.experience >= 3)
        experienceScore = 90;
    else if(sitter.experience >= 2)
        experienceScore = 70;
    else if(sitter.experience >= 1)
        experienceScore = 60;
    else if(sitter.experience >= 0)
        experienceScore = 50;

    matchData.experience = { label: 'Experience', value: Math.round(experienceScore)}; // send data to client
    if(typeof parent.children.hobbies !== "undefined" && parent.children.hobbies.length > 0){  // calculate hobbies match of the sitter with child
        _.forEach(parent.children.hobbies, function(hobbie) {
            if(_.indexOf(sitter.hobbies,hobbie) > -1){ // check if sitter have the hobbie
                hobbiesScore +=  (100 / parent.children.hobbies.length);  // add the fraction of 1 match from the length of the hobbie array
            }
        });
        //matchData.hobbies = { label: 'Hobbies', value: Math.round(hobbiesScore)}; // send data to client
    }
    else{
        hobbiesScore = -1;  // children don't have any hobbies
    }

    if(typeof parent.children.expertise !== "undefined" && parent.children.expertise.length > 0){
        _.forEach(parent.children.expertise, function(exp) {
            if(_.indexOf(sitter.expertise,exp) > -1){ // check if sitter have the expertise
                knowledgeScore +=  (100 / parent.children.expertise.length);   // add the fraction of 1 match from the length of the expertise array
            }
        });
        //matchData.expertise =  { label: 'Expertise', value: Math.round(hobbiesScore)}; // send data to client
    }
    else{
        knowledgeScore = -1;  // children don't have any expertise
    }

    if(filter == null){
        divide = 2;
        score = locationScore + experienceScore;
        if(knowledgeScore >= 0 ){
            divide++;
            score += knowledgeScore;
        }
        if(hobbiesScore >= 0){
            divide++;
            score += hobbiesScore;
        }
        _.forIn(matchData, function(value, key) {
            if(key !== 'matchScore')
                value.value = (value.value / divide);
        });
        if(hobbiesScore !== -1)
            matchData.hobbies = { label: 'Hobbies', value: Math.round(hobbiesScore)}; // send data to client
        if(knowledgeScore !== -1)
            matchData.expertise =  { label: 'Expertise', value: Math.round(hobbiesScore)}; // send data to client
        generalScore = score/divide;
    }
    else{  // 70% for the filter category, else get 10% or more if child don't have the categories
        divide = 1;
        tempScore = 0;
        //score = locationScore + experienceScore;
        if(knowledgeScore >= 0 ){
            divide++;
            tempScore += knowledgeScore;
        }
        if(hobbiesScore >= 0){
            divide++;
            tempScore += hobbiesScore;
        }

        if(filter == "location"){
            score += locationScore * 0.7;
            tempScore += experienceScore;
        }
        else if(filter == "experience"){
            score += experienceScore * 0.7;
            tempScore += locationScore;
        }
        generalScore += (0.3 * (tempScore / divide)) + score;
    }

    // bonus section - for each bonus sitter gets +5% match to general score
    if(sitter.availableNow){
        generalScore += bonusScore;
        matchData.availableNow = { label: 'Available Now', value: bonusScore };
    }

    if(sitter.mobility){
        generalScore += bonusScore;
        matchData.mobility = { label: 'Mobility', value: bonusScore };
    }

    if(_.indexOf(sitter.education,'college') !== -1) {
        matchData.college = { label: 'College', value: bonusScore };
        generalScore += bonusScore;
    }

    if(_.indexOf(sitter.education,'highSchool') !== -1){
        generalScore += bonusScore;
        matchData.highSchool = { label: 'High School', value: bonusScore };
    }

    let personalityParent = {
        questions: [{
        start: "yoel",
            end: "yoel",
            value: 5
        },{
            start: "yoel1",
            end: "yoel1",
            value: 2
        },{
            start: "yoe2",
            end: "yoe2",
            value: 3
        }],
        totalScore: 10

    };
    let personalitySitter = {
        questions: [{
            start: "yoel",
            end: "yoel",
            value: 5
        },{
            start: "yoel1",
            end: "yoel1",
            value: 4
        },{
            start: "yoel2",
            end: "yoel2",
            value: 3
        }],
        totalScore: 12

    };
    let personalitySameQuestions = [];
    for(let index = 0; index < 3; index++){ // TODO: when all questions is up change for loop to 10
        if(personalityParent.questions[index].value === personalitySitter.questions[index].value){
            personalitySameQuestions.push(personalitySitter.questions[index]);
        }
    }
    let testScore = 0;
    let testScoreDiffrence = Math.abs(personalityParent.totalScore -  personalitySitter.totalScore);
    if(testScoreDiffrence <= 10){
        testScore = 100;
    }
    else if(testScoreDiffrence > 10 && testScoreDiffrence <= 20){
        testScore = 80;
    }
    else if(testScoreDiffrence > 20 && testScoreDiffrence <= 30){
        testScore = 60;
    }
    else if(testScoreDiffrence > 30){
        testScore = 40;
    }
    matchData.testScore = { label: 'Personality Score', value:testScore};

   // generalScore = Math.round(generalScore);
    if(generalScore > 100) // more than 100% match with the bonuses
        generalScore = 100;
    else
        matchData.unreachedScore = { label: 'Unreached', value: Math.round(100 - generalScore)};
    finish = false;  // exit the sync loop
    generalScore = ((generalScore * 0.7) + (testScore * 0.3)); // matcher = 70%, personality-test = 30%
    matchData.matchScore = Math.ceil(generalScore);
    if(personalitySameQuestions.length > 0)
        matchData.personalityQuestions = personalitySameQuestions;
    callback(matchData);
};

exports.calculateMatchingScore = function(parent,sitter){
    sitter.address = sitter.address._doc;
    // data = jsonfile.readFileSync(localJSONPath);// TODO: local db only
    let match = computeMatchScore(parent,sitter,null,distance);
    if(match.matchScore == 0){
        return {"matchScore":0};  // no match
    }
    else{
        return  match;
    }
};