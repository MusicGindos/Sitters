'use strict';
var express		= require('express'),
    controller 	= require('./server'),
    cors 		= require('cors'),
    bodyParser 	= require('body-parser'),
    port 		= process.env.PORT || 4444,
    app 		= express();

//server config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/build/'));
app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Type", "application/json");
    next();
});

app.get('/', controller.index);

app.post('/parent/create', controller.createParent);
app.post('/parent/update', controller.updateParent);
app.delete('/parent/delete', controller.deleteParent);
app.post('/parent/get', controller.getParent);
app.post('/parent/getMatches', controller.getMatches);
app.post('/parent/getSitters', controller.getSitters);
app.post('/parent/updateMutualFriends', controller.updateMutualFriends);
app.post('/parent/notifications', controller.notifications);
app.post('/sitter/create', controller.createSitter);
app.post('/sitter/update', controller.updateSitter);
app.delete('/sitter/delete', controller.deleteSitter);
app.post('/sitter/get', controller.getSitter);
app.post('/sitter/updateMutualFriends', controller.updateMutualFriends);
app.post('/user/getUser', controller.getUser);
app.post('/invite/create', controller.sendInvite);
app.get('*', (req,res,next) => {
    let err = new Error();
    err.status = 404;
    next(err);
});

app.use((err,req,res) => {
    if(err.status == 404){
    return res.status(404).end(err.message);
    }
    else if(err.status == 500){
        return res.status(500).end(err.message);
    }
});

app.listen(port, () => {  // app listen port
    console.log('listening on port '+ port);
});

