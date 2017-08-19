const SCORE_SETS = {
    default: {
        Proximity: 0.2,
        Experience: 0.35,
        ReliabilityScore: 0.35,
        Education: 0.1
    },
    withoutExpertise: {
        Proximity: 0.2,
        Experience: 0.35,
        ReliabilityScore: 0.25,
        Education: 0.1,
        Hobbies: 0.1
    },
    withoutHobbies: {
        Proximity: 0.2,
        Experience: 0.35,
        ReliabilityScore: 0.25,
        Education: 0.1,
        Expertise: 0.1
    },
    withExpertiseAndHobbies: {
        Proximity: 0.2,
        Experience: 0.35,
        ReliabilityScore: 0.25,
        Education: 0.1,
        Hobbies: 0.05,
        Expertise: 0.05
    },
};
module.exports.scoreSets = SCORE_SETS;
