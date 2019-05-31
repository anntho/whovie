const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../bin/config.json');
const key = config.atlas.key;

mongoose.connect(`mongodb+srv://apecs:${key}@whovie-aqnbv.mongodb.net/whovie?retryWrites=true`, {useNewUrlParser: true});
 
const s1 = new mongoose.Schema({
    type: String,
    question: String,
    choices: {
        correct: String,
        other1: String,
        other2: String,
        other3: String
    }
});

const s2 = new mongoose.Schema({
    list: String,
    listID: String,
    title: String,
    overview: String,
    correct: [String],
    incorrect: [String]
});

const question = mongoose.model('question', s1);
const round = mongoose.model('round', s2);

async function fetchListQuestions(model, id) {
    let obj = {};
    if (id) {
        obj.listID = id;
    }
    return new Promise((resolve, reject) => {
        model.find(obj, (err, docs) => {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

async function fetchTriviaQuestions(model) {
    return new Promise((resolve, reject) => {
        model.find({}, function (err, docs) {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/api/data/trivia/questions', async (req, res) => {
    try {
        let response = await fetchTriviaQuestions(question);
        res.json(response);
    } catch (err) {
        res.sendStatus(500);
    }
});

router.get('/api/data/list/:id', async (req, res) => {
    let id = String(req.params.id);
    let response = [];
    try {
        if (id === '0') {
            response = await fetchListQuestions(round);
        } else {
            response = await fetchListQuestions(round, id);
        }
        res.json(response);
    } catch (err) {
        res.sendStatus(500);
    }
});

module.exports = router;