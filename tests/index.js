const chai = require('chai'),
     expect = chai.expect, // we are using the "expect" style of Chai
    matcher = require('../modules/matcher');
const parent = require('./statics').parent;
const sitter = require('./statics').sitter;

describe('isMatch', function() {
    it('isMatch(sitter, parent) Check if the sitter and parent have a match', function() {
        matcher.isMatch(parent, sitter, function(sitterObj){
            expect(sitterObj.match.matchScore).to.be.at.least(50);
        });
    });
});

describe('isMatch', function() {
    it('isMatch({}, parent) Check if the sitter and empty parent have a match', function() {
        matcher.isMatch({}, sitter, function(sitterObj){
            expect(sitterObj.match.matchScore).to.be.empty;
        });
    });
});

describe('isMatch', function() {
    it('isMatch(sitter, {}) Check if empty sitter and parent have a match', function() {
        matcher.isMatch(parent, {}, function(sitterObj){
            expect(sitterObj.match.matchScore).to.be.empty;
        });
    });
});

describe('isMatch', function() {
    it('isMatch({}, {}) Check if empty sitter and empty parent have a match', function() {
        matcher.isMatch({}, {}, function(sitterObj){
            expect(sitterObj.match.matchScore).to.be.empty;
        });
    });
});


describe('isMatch', function() {
    it('isMatch(sitter, parent) Check if the sitter which not allowing search and parent have a match', function() {
        sitter.settings.allowShowOnSearch = false;
        matcher.isMatch(parent, sitter, function(sitterObj){
            expect(sitterObj.match.matchScore).to.be.empty;
        });
    });
});

describe('isMatch', function() {
    it('isMatch({}, parent) Check if the sitter which not allowing search and empty parent have a match', function() {
        sitter.settings.allowShowOnSearch = false;
        matcher.isMatch({}, sitter, function(sitterObj){
            expect(sitterObj.match.matchScore).to.be.empty;
        });
    });
});