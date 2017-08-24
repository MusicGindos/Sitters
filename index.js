'use strict';

// dependencies
const express = require('express'),
    controller = require('./sittersAPI'),
    cors = require('cors'),
    bodyParser = require('body-parser');

// configurations
const port = process.env.PORT || 4444,
app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/build/'));
app.use(cors());

// set headers
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', ['POST', 'PUT', 'DELETE']);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Content-Type", ['text/html', 'application/json']);
    next();
});

// set server endpoints
app.post('/user/create', controller.createUser);
app.post('/user/get', controller.getUser);
app.put('/user/update', controller.updateUser);
app.delete('/user/delete', controller.deleteUser);
app.post('/parent/getMatches', controller.getMatches);
app.put('/user/updateFriends', controller.updateFriends);
app.post('/invite/create', controller.sendInvite);
app.put('/invite/update', controller.updateInvite);

app.get('sitters/', (req, res, next) => {
   console.log('get sitter');
});

// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    next(err);
});

app.listen(port, () => {
    console.log('listening on port '+ port);
});

