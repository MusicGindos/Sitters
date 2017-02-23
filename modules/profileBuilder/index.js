let personalityTest = require('../personalityTest');

exports.createPersonalityTest = (req,res,next) =>{
    personalityTest.getQuestions(req,res,next);
};

exports.computePersonalityScore = (req,res,next) =>{
    personalityTest.computePersonalityScore(req,res,next);
};
