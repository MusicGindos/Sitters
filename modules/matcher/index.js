'use strict';

var express		    = require('express'),
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
    bonusScore      = 2.5,
    score           = 0,
    divide          = 0,
    tempScore       = 0;

let computeSync = function(origin,destination,callback){  // google-distance is async and we need it to be sync so we use wrapper with flag
    googleDistance.apiKey = "AIzaSyBwP7ZYyCO86H41nE-E5eHYPCDir9yBpc0";  // google-distance apikey for make more calls
    googleDistance.get(  // compute distance between 2 locations, can be street-houseNumber-city OR latitude/longitude
        {
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
    if(data.parent.address.latitude != 0 && data.parent.address.longitude != 0){  // compute by latitude and longitude
        origin = data.parent.address.latitude + ',' + data.parent.address.longitude
    }
    else{ //compute by address
        origin = data.parent.address.street + ' ' + data.parent.address.houseNumber + ' ' + data.parent.address.city;
    }
    if(data.sitter.address.latitude != 0 && data.sitter.address.longitude != 0){// compute by latitude and longitude
        destination = data.sitter.address.latitude + ',' + data.sitter.address.longitude
    }
    else{ //compute by address
        destination = data.sitter.address.street + ' ' + data.sitter.address.houseNumber + ' ' + data.sitter.address.city;
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
    if(parent.children.specialNeeds.length != 0){
        for (let i = 0, len = parent.children.specialNeeds.length; i < len; i++) {
            if (_.indexOf(sitter.specialNeeds, parent.children.specialNeeds[i]) == -1){
                finish = false;
                callback(0);
                return;
            }
            // sitter don't have the speicalNeed that the child need and the match score is 0
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

    if(parent.children.hobbies.length > 0){  // calculate hobbies match of the sitter with child
        _.forEach(parent.children.hobbies, function(hobbie) {
            if(_.indexOf(sitter.hobbies,hobbie) > -1){ // check if sitter have the hobbie
                hobbiesScore +=  (100 / parent.children.hobbies.length);  // add the fraction of 1 match from the length of the hobbie array
            }
        });
    }
    else{
        hobbiesScore = -1;  // children don't have any hobbies
    }

    if(parent.children.expertise.length > 0){
        _.forEach(parent.children.expertise, function(exp) {
            if(_.indexOf(sitter.expertise,exp) > -1){ // check if sitter have the expertise
                knowledgeScore +=  (100 / parent.children.expertise.length);   // add the fraction of 1 match from the length of the expertise array
            }
        });
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
    if(sitter.availableNow)
        generalScore += bonusScore;
    if(sitter.mobility)
        generalScore += bonusScore;
    if(_.indexOf(sitter.education,'college'))
        generalScore += bonusScore;
    if(_.indexOf(sitter.education,'highSchool'))
        generalScore += bonusScore;

    if(generalScore > 100) // more than 100% match with the bonuses
        generalScore = 100;
    finish = false;  // exit the sync loop
    generalScore = ((generalScore * 0.7) + (sitter.personalityScore * 0.3)); // matcher = 70%, personality-test = 30%
    callback(generalScore);
};

exports.calculateMatchingScore = function(){
    data = jsonfile.readFileSync(localJSONPath);
    matchScore = computeMatchScore(data.parent,data.sitter,null,distance);
    if(matchScore == 0){
        return {"match_score":0};  // no match
    }
    else{
        return {"match_score":Math.ceil(matchScore)};
    }
};