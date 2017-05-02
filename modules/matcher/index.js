'use strict';

let express		    = require('express'),
    fs			    = require('fs'),
    _               = require('lodash'),
    googleDistance  = require('google-distance'),
    finish          = true,
    maindata        = null,
    origin          = null,
    destination     = null,
    distance        = null,
    generalScore    = 0,
    proximityScore   = null,
    experienceScore = null,
    sameHobbies    = 0,
    sameExpertise  = null,
    collegeScore = 0,
    highSchoolScore = 0,
    matchData       = [];


let init = function(){
        finish = true,
        maindata = origin = destination = distance = proximityScore = experienceScore = sameExpertise  = null,
        sameHobbies = generalScore = collegeScore = highSchoolScore = 0,
        matchData       = []
};
let scoreSet = {
    default:{
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.35,
        college: 0.05,
        highSchool: 0.05
    },
    withoutExpertise:{
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.25,
        college: 0.05,
        highSchool: 0.05,
        hobbies:  0.1
    },
    withoutHobbies:{
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.25,
        college: 0.05,
        highSchool: 0.05,
        expertise: 0.1
    },
    withExpertiseAndHobbies:{
        proximity: 0.2,
        experience: 0.35,
        personalityTest: 0.25,
        college: 0.05,
        highSchool: 0.05,
        hobbies: 0.05,
        expertise: 0.05
    },

};


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
    init();
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

    //proximity score
    distance = distance.distance.split(' ');
    distance = Number(distance[0]);  // distance between 2 locations with google-distance
    if(distance <= 5)   // calculate location score
        proximityScore = 100;
    else{
        proximityScore = 100 - ((distance-5) * 2); //for each added 1 km more than 5, reduce 2
    }
    if(proximityScore < 0)  // if the sitter is more than 50 kilometer from thr child address
        proximityScore = 0;
    matchData.push({ name: 'proximity', value: Math.round(proximityScore)});

    //experience score
    if(sitter.experience >= 4)  // calculate experience by years
        experienceScore = 100;
    else if(sitter.experience >= 3)
        experienceScore = 90;
    else if(sitter.experience >= 2)
        experienceScore = 75;
    else if(sitter.experience >= 1)
        experienceScore = 60;
    else if(sitter.experience >= 0)
        experienceScore = 0;
    matchData.push({ name: 'experience', value: Math.round(experienceScore)});

    //hobbies score
    if(typeof parent.children.hobbies !== "undefined" && parent.children.hobbies.length > 0 && sitter.hobbies.length > 0){  // calculate hobbies match of the sitter with child
        _.forEach(parent.children.hobbies, function(hobbie) {
            if(_.indexOf(sitter.hobbies,hobbie) > -1){ // check if sitter have the hobbie
                //hobbiesScore +=  (100 / parent.children.hobbies.length);  // add the fraction of 1 match from the length of the hobbie array
                sameHobbies++;
            }
        });
    }
    else{
        sameHobbies = -1;  // children don't have any hobbies
    }


    //expertise score
    if(typeof parent.children.expertise !== "undefined" && parent.children.expertise.length > 0 && sitter.expertise.length > 0){
        _.forEach(parent.children.expertise, function(exp) {
            if(_.indexOf(sitter.expertise,exp) > -1){ // check if sitter have the expertise
                // knowledgeScore +=  (100 / parent.children.expertise.length);   // add the fraction of 1 match from the length of the expertise array
                sameExpertise++;
            }
        });
    }
    else{
        sameExpertise = -1;  // children don't have any expertise
    }

    // if(filter == null){
    //     divide = 2;
    //     score = proximityScore + experienceScore;
    //     if(knowledgeScore >= 0 ){
    //         divide++;
    //         score += knowledgeScore;
    //     }
    //     if(hobbiesScore >= 0){
    //         divide++;
    //         score += hobbiesScore;
    //     }
    //     _.forIn(matchData, function(value, key) {
    //         if(key !== 'matchScore')
    //             value.value = (value.value / divide);
    //     });
    //     if(hobbiesScore !== -1)
    //         matchData.hobbies = { label: 'Hobbies', value: Math.round(hobbiesScore)}; // send data to client
    //     if(knowledgeScore !== -1)
    //         matchData.expertise =  { label: 'Expertise', value: Math.round(hobbiesScore)}; // send data to client
    //     generalScore = score/divide;
    // }
    // else{  // 70% for the filter category, else get 10% or more if child don't have the categories
    //     divide = 1;
    //     tempScore = 0;
    //     //score = proximityScore + experienceScore;
    //     if(knowledgeScore >= 0 ){
    //         divide++;
    //         tempScore += knowledgeScore;
    //     }
    //     if(hobbiesScore >= 0){
    //         divide++;
    //         tempScore += hobbiesScore;
    //     }
    //
    //     if(filter == "location"){
    //         score += proximityScore * 0.7;
    //         tempScore += experienceScore;
    //     }
    //     else if(filter == "experience"){
    //         score += experienceScore * 0.7;
    //         tempScore += proximityScore;
    //     }
    //     generalScore += (0.3 * (tempScore / divide)) + score;
    // }

    if(sitter.mobility)
        generalScore += 5;

    if(_.indexOf(sitter.education,'college') !== -1) {
        collegeScore = 5;
        generalScore += 5;
    }
    if(_.indexOf(sitter.education,'highSchool') !== -1){
        highSchoolScore = 5;
        generalScore += 5;
        matchData.push({ name: 'Education', value: 100});
    }
    else{
        matchData.push({ name: 'Education', value: 50});
    }

    //let personalitySameQuestions = [];
    // for(let index = 0; index < 3; index++){ // TODO: when all questions is up change for loop to 10
    //     if(personalityParent.questions[index].value === personalitySitter.questions[index].value){
    //         personalitySameQuestions.push(personalitySitter.questions[index]);
    //     }
    // }
    let testScore = 0;
    let testScoreDifference = Math.abs(parent.personalityTest.totalScore -  sitter.personalityTest.totalScore);
    if(testScoreDifference <= 10){
        testScore = 100;
    }
    else if(testScoreDifference > 10 && testScoreDifference <= 20){
        testScore = 80;
    }
    else if(testScoreDifference > 20 && testScoreDifference <= 30){
        testScore = 60;
    }
    else if(testScoreDifference > 30){
        testScore = 40;
    }
    matchData.push({ name: 'Personality Score', value: testScore});

    if(sameHobbies > 0){
        if(sameExpertise > 0) { // hobbies and expertise score set
            if(sameHobbies > 1){
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 100;
                matchData.push({ name: 'Hobbies', value: 100});
            }
            else{
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 50;
                matchData.push({ name: 'Hobbies', value: 50});
            }
            if(sameExpertise > 1){
                generalScore += scoreSet.withExpertiseAndHobbies.expertise * 100;
                matchData.push({ name: 'Expertise', value: 100});
            }
            else{
                generalScore += scoreSet.withExpertiseAndHobbies.expertise * 50;
                matchData.push({ name: 'Expertise', value: 50});
            }
            generalScore += scoreSet.withExpertiseAndHobbies.college * collegeScore;
            generalScore += scoreSet.withExpertiseAndHobbies.experience * experienceScore;
            generalScore += scoreSet.withExpertiseAndHobbies.highSchool * highSchoolScore;
            generalScore += scoreSet.withExpertiseAndHobbies.proximity * proximityScore;
            generalScore += scoreSet.withExpertiseAndHobbies.personalityTest * testScore;
        }
        else{ // hobbies score set
            if(sameHobbies > 1){
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 100;
                matchData.push({ name: 'Hobbies', value: 100});
            }
            else{
                generalScore += scoreSet.withExpertiseAndHobbies.hobbies * 50;
                matchData.push({ name: 'Hobbies', value: 50});
            }
            generalScore += scoreSet.withoutExpertise.college * collegeScore;
            generalScore += scoreSet.withoutExpertise.experience * experienceScore;
            generalScore += scoreSet.withoutExpertise.highSchool * highSchoolScore;
            generalScore += scoreSet.withoutExpertise.proximity * proximityScore;
            generalScore += scoreSet.withoutExpertise.personalityTest * testScore;
        }
    }
    else if(sameExpertise > 0){// expertise score set
        if(sameExpertise > 1){
            generalScore += scoreSet.withExpertiseAndHobbies.expertise * 100;
            matchData.push({ name: 'Expertise', value: 100});
        }
        else{
            generalScore += scoreSet.withExpertiseAndHobbies.expertise * 50;
            matchData.push({ name: 'Expertise', value: 50});
        }
        generalScore += scoreSet.withoutHobbies.college * collegeScore;
        generalScore += scoreSet.withoutHobbies.experience * experienceScore;
        generalScore += scoreSet.withoutExpertise.highSchool * highSchoolScore;
        generalScore += scoreSet.withoutHobbies.proximity * proximityScore;
        generalScore += scoreSet.withoutHobbies.personalityTest * testScore;
    }
    else{ // default score set
        generalScore += scoreSet.default.college * collegeScore;
        generalScore += scoreSet.default.experience * experienceScore;
        generalScore += scoreSet.default.highSchool * highSchoolScore;
        generalScore += scoreSet.default.proximity * proximityScore;
        generalScore += scoreSet.default.personalityTest * testScore;
    };
    if(generalScore > 100) // more than 100% match with the bonuses
        generalScore = 100;
    finish = false;  // exit the sync loop
    let match = {};
    match.matchScore = Math.ceil(generalScore);
    match.data = _.orderBy(matchData, ['value'], ['desc']);
    callback(match);
};

exports.calculateMatchingScore = function(parent,sitter){
    sitter.address = sitter.address._doc;
    let match = computeMatchScore(parent,sitter,null,distance);
    if(match.matchScore == 0){
        return {"matchScore":0};  // no match
    }
    else{
        return  match;
    }
};