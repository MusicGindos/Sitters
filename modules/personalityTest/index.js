let shuffle = require('shuffle-array');

let questions = [{
    "question": "I consider myself as an investor in his own field",
    "category": "characteristics",
    "method": "normal",
    "choice": 1
},{
    "question": "I consider myself a responsible person",
    "category": "characteristics",
    "method": "normal",
    "choice": 2
},{
    "question": "I consider myself as having a sensitivity to the needs of others",
    "category": "characteristics",
    "method": "normal",
    "choice": 4
},{
    "question": "I used to invest mainly in the things I'm good, and to give up when I'm having difficulty",
    "category": "characteristics",
    "method": "reverse",
    "choice": 5
},{
    "question": "I consider myself as a creative person who can provide children with an interest",
    "category": "characteristics",
    "method": "normal",
    "choice": 2
},{
    "question": "It is important for me to know everything you expect me to clearly and completely",
    "category": "expectations",
    "method": "normal",
    "choice": 3
},{
    "question": "I consider myself punctual times",
    "category": "expectations",
    "method": "normal",
    "choice": 4
},{
    "question": "I believe I can fulfill the expectations of parents",
    "category": "expectations",
    "method": "normal",
    "choice": 5
},{
    "question": "It is important to me that parents will be satisfied with my work",
    "category": "expectations",
    "method": "normal",
    "choice": 1
},{
    "question": "I expect myself to demonstrate assertiveness in cases where children have demonstrated a lack of discipline",
    "category": "expectations",
    "method": "normal",
    "choice": 3
},{
    "question": "Especially problematic situations of stress I can't handle",
    "category": "Integrity",
    "method": "reverse",
    "choice": 2
},{
    "question": "I think that all people in the world are honest",
    "category": "Integrity",
    "method": "special",
    "choice": 4
},{
    "question": "At least once in life I took an object that belongs to someone without permission",
    "category": "Integrity",
    "method": "normal",
    "choice": 3
},{
    "question": "In the case of an extreme lack of knowledge of how to correctly operate, I will be relying on my intuition and not call to ask the parents.",
    "category": "Integrity",
    "method": "reverse",
    "choice": 2
},{
    "question": "The boy cursed his brother and will be punished if parents know, so you'd rather not tell his parents of child care",
    "category": "Integrity",
    "method": "reverse",
    "choice": 4
}];

exports.getQuestions = (req,res) => {
    res.status(200).json(shuffle(shuffle(questions))); // shuffle questions for client
};

exports.computePersonalityScore = () => {// TODO: when client is up, pass questions
    console.log("hello");
    let score = 0;
    if(!questions.isEmpty){
        //console.log("full");
        questions.forEach(function(question){
            console.log(score);
            switch(question.method){
                case "normal":  // the score is 20 to 100 from 1 - 5
                    //console.log(parseInt(question.choice) * 20);
                    score += (parseInt(question.choice) * 20);
                    break;
                case "reverse":  // the score is 100 to 20 from 5 - 1
                    if(question.choice == "1" || question.choice == "5")
                        score += (100 / parseInt(question.choice));
                    else if(question.choice == "2")
                        score += 80;
                    else if(question.choice == "4")
                        score += 40;
                    else
                        score += 60;
                    break;
                case "special":  // special question, 1/5 = 40, 2/4 = 70, 3 = 100
                    if(question.choice == "1" || question.choice == "5")
                        score += 40;
                    else if(question.choice == "2" || question.choice == "4")
                        score += 70;
                    else
                        score += 100;
                    break;
            }
        });
        score = (score/15).toFixed(2); // average of 15 questions, toFixed - leave 2 digits after dot
    }
    return score;
};