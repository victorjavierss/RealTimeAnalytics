/*
 * Base API Communication
 * Copyright (c) 2014
 * Author: Victor Sanchez
 * Version: 1.0
 */

RealTimeAnalytics = function( customer ){
    this.customerApiKey = customer;
    this.io = io.connect('http://localhost:7076');
    this.io.emit('ready',  this.customerApiKey);
    this.guid = guid();
    var rta  = this;
    window.onload = function(e){ window.onunload = function(e){ rta.sendUnLoad(); } }
}

RealTimeAnalytics.prototype.customerApiKey = null;
RealTimeAnalytics.prototype.loadedVids = {};
RealTimeAnalytics.prototype.lastEventSentForVid = {};
RealTimeAnalytics.prototype.events = {};
RealTimeAnalytics.prototype.events.LOAD   = 'videoLoaded';
RealTimeAnalytics.prototype.events.PLAY   = 'videoPlayed';
RealTimeAnalytics.prototype.events.PAUSE  = 'videoPaused';
RealTimeAnalytics.prototype.events.STOP   = 'videoStopped';
RealTimeAnalytics.prototype.events.BUFFER = 'videoBuffer';
RealTimeAnalytics.prototype.events.ERROR  = 'videoError';
RealTimeAnalytics.prototype.events.UNLOAD    = 'videoUnloaded';
RealTimeAnalytics.prototype.events.LOAD_TIME = 'videoLoadTime';
RealTimeAnalytics.prototype.events.PLAYHEAD_UPDATE = 'videoPlayheadUpdate';

RealTimeAnalytics.prototype.getIdentifier = function ( vidMetadata ){
    return vidMetadata[RealTimeAnalyticsPluginBase.VIDEO_IDENTIFIER];
}

RealTimeAnalytics.prototype.emit = function(event, vidMetadata, force){
    if( this.lastEventSentForVid[ this.getIdentifier(vidMetadata) ] != event || force){
        console.log(" baseApi :: "+event+" :: " + this.getIdentifier(vidMetadata) );
        this.lastEventSentForVid[ this.getIdentifier(vidMetadata) ] = event;
        this.io.emit(event, { 'c':this.customerApiKey, 'm':vidMetadata, 'g': this.guid} );
    }else{
        console.log( event + " already sent!!");
    }
}

RealTimeAnalytics.prototype.sendLoad = function( vidMetadata ){
    this.loadedVids[ this.getIdentifier(vidMetadata)  ] = vidMetadata;
    this.emit( this.events.LOAD, vidMetadata );
}

RealTimeAnalytics.prototype.sendPlay = function( vidMetadata ){
    this.emit( this.events.PLAY, vidMetadata );
}

RealTimeAnalytics.prototype.sendPause = function( vidMetadata ){
    this.emit( this.events.PAUSE, vidMetadata );
}

RealTimeAnalytics.prototype.sendLoadTime = function( vidMetadata ){
     this.emit( this.events.LOAD_TIME, vidMetadata );
}

RealTimeAnalytics.prototype.sendBuffer = function(vidMetadata){
    this.emit( this.events.BUFFER, vidMetadata );
}

RealTimeAnalytics.prototype.sendError = function(vidMetadata){
    this.emit( this.events.ERROR, vidMetadata );
}

RealTimeAnalytics.prototype.sendStop = function( vidMetadata ){
    this.emit( this.events.STOP, vidMetadata );
}

RealTimeAnalytics.prototype.sendPlayHeadUpdate = function( vidMetadata ){
    this.emit(rap.events.PLAYHEAD_UPDATE, vidMetadata, true);
}

RealTimeAnalytics.prototype.sendUnLoad = function(){
    for( var key in this.loadedVids ){
        this.emit( this.events.UNLOAD, this.loadedVids[ key ] );
    }
}

RealTimeAnalyticsPluginBase = {};
RealTimeAnalyticsPluginBase.MAX_INTENTS = 10;
RealTimeAnalyticsPluginBase.VIDEO_NAME = 'video_name';
RealTimeAnalyticsPluginBase.VIDEO_IDENTIFIER = 'video_identifier';
RealTimeAnalyticsPluginBase.VIDEO_DURATION = 'video_duration';
RealTimeAnalyticsPluginBase.VIDEO_DOMAIN = 'video_domain';
RealTimeAnalyticsPluginBase.VIDEO_DEVICE = 'video_device';
RealTimeAnalyticsPluginBase.VIDEO_THUMBNAIL = 'video_thumbnail';
RealTimeAnalyticsPluginBase.VIDEO_LOAD_TIME = 'video_load_time';
RealTimeAnalyticsPluginBase.VIDEO_ERROR_CODE = 'video_error_code';

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
})();