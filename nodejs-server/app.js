CUSTOMER_DASHBOARD_URL = "http://localhost/test/api/dashboard/";
Events = {};
Events.READY  = 'ready';
Events.LOAD   = 'videoLoaded';
Events.PLAY   = 'videoPlayed';
Events.PAUSE  = 'videoPaused';
Events.STOP   = 'videoStopped';
Events.BUFFER = 'videoBuffer';
Events.ERROR  = 'videoError';
Events.UNLOAD    = 'videoUnloaded';
Events.LOAD_TIME = 'videoLoadTime';
Events.PLAYHEAD_UPDATE = 'videoPlayheadUpdate';

EventString = {};
EventString [Events.READY]  = 'Ready';
EventString [Events.LOAD]   = 'Video Loaded';
EventString [Events.PLAY]   = 'Video Played';
EventString [Events.PAUSE]  = 'Video Paused';
EventString [Events.STOP]   = 'Video Stopped';
EventString [Events.BUFFER] = 'Video Buffer';
EventString [Events.ERROR]  = 'Video Error';
EventString [Events.UNLOAD]    = 'Video Unloaded';
EventString [Events.LOAD_TIME] = 'Video Load Time';
EventString [Events.PLAYHEAD_UPDATE] = 'Video Playhead';

app = require('express.io')()
request = require("request");
app.http().io();

// Setup the ready route, join room and broadcast to room.
app.io.route(Events.READY, function(req) {
	console.log('Joined ' + req.data);
    req.io.join(req.data)
});

app.io.route(Events.LOAD, function(req){
	sendCustomerDashboard(Events.LOAD, req);
});

app.io.route(Events.PLAY, function(req){
	sendCustomerDashboard(Events.PLAY, req);
});

app.io.route(Events.PAUSE, function(req){
	sendCustomerDashboard(Events.PAUSE, req);
});

app.io.route(Events.STOP, function(req){
	sendCustomerDashboard(Events.STOP, req);
});

app.io.route(Events.BUFFER, function(req){
	sendCustomerDashboard(Events.BUFFER, req);
});

app.io.route(Events.ERROR, function(req){
	sendCustomerDashboard(Events.ERROR, req);
});

app.io.route(Events.LOAD_TIME, function(req){
	sendCustomerDashboard(Events.LOAD_TIME, req);
});

app.io.route(Events.UNLOAD, function(req){
	sendCustomerDashboard(Events.UNLOAD, req);
});

app.io.route(Events.PLAYHEAD_UPDATE, function(req){
	sendCustomerDashboard(Events.PLAYHEAD_UPDATE, req);
});

// Send the client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
});

app.get('/datatable.js', function(req, res) {
    res.sendfile(__dirname + '/datatable.js')
});

function makeDataPermanent( event, data ){
	request(CUSTOMER_DASHBOARD_URL + event, function(error, response, body) { console.log(body); });
}

function getBroadcastCustomerDashboardDestination(room){
    return room + '-customerDashboard';
}

function sendCustomerDashboard(event, req){
	var to = getBroadcastCustomerDashboardDestination( req.data.c );
	console.log('Broadcasting [' + EventString[ event ] + '] to => ' + to );
	req.io.room( to ).broadcast(event, { m: req.data.m, g: req.data.g });
}

app.listen(7076)
console.log('Ready!');