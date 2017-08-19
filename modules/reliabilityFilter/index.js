'use strict';

// dependencies
const _ = require('lodash');

let getPersonalityWords = function (requiredPersonality, sitterPersonality) {
    return _.intersection(requiredPersonality, sitterPersonality);
};

let getUsersRatingScore = function (reviews) {
    let ratingScore = 0;
    _.forEach(reviews, review => {
        const reviewScore = _.sum(Object.values(review.rates));
        ratingScore += reviewScore > 12 ? 10 : -10;
    });
    return ratingScore;
};

let getMutualFriends = function (parentFriends, sitterFriends) {
    return _.intersectionBy(parentFriends, sitterFriends, "id");
};

module.exports.getReliabilityScore = function (parent, sitter) {
    let reliabilityScore = 0;
    const personalityWords = getPersonalityWords(parent.personality, sitter.personality);
    const mutualFriends = getMutualFriends(parent.friends, sitter.friends);
    const usersRatingsScore = getUsersRatingScore(sitter.reviews);
    if (mutualFriends.length > 0) {
        if (mutualFriends.length > 2)
            reliabilityScore += ( 50 + ( 10 * (mutualFriends.length - 2)));
        else
            reliabilityScore += mutualFriends.length === 2 ? 50 : 30;
    }
    const wordsCount = personalityWords.length;
    if (wordsCount > 0) {
        if (wordsCount > 2)
            reliabilityScore += (25 + ((wordsCount - 2) * 20));
        else
            reliabilityScore += wordsCount === 2 ? 25 : 10;
    }
    reliabilityScore += usersRatingsScore;
    return reliabilityScore;
};

module.exports.getMutualFriends = getMutualFriends;
