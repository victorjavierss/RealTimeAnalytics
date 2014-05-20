/*
 * Ooyala Plugin package
 * Copyright (c) 2013
 * Author: Victor Sanchez
 * Version: 0.0.1
 */

OO.plugin("OoyalaRealTimeAnalyticsPlugin", function (playerId) {

    var RealTimeAnalyticsPlugin = {};
   /* var playerIdentificator = playerId; */
    var initialTime;

    var states = { 'PLAY':'play',
                   'PAUSE':'pause',
                   'BUFFER':'buffer',
                   'STOP':'stop',
                   'INIT':'init',
                   'PLAYHEAD': 'playhead'};

    var validTransitions = {};

    validTransitions[ states.INIT ] = {};
    validTransitions[ states.INIT ][ states.PLAY  ] = true;
    validTransitions[ states.INIT ][ states.BUFFER] = true;

    validTransitions[ states.PLAY ] = {};
    validTransitions[ states.PLAY ][ states.PAUSE   ] = true;
    validTransitions[ states.PLAY ][ states.STOP    ] = true;
    validTransitions[ states.PLAY ][ states.BUFFER  ] = true;
    validTransitions[ states.PLAY ][ states.PLAYHEAD] = true;

    validTransitions[ states.PLAYHEAD ] = {};
    validTransitions[ states.PLAYHEAD ][ states.PLAYHEAD] = true;
    validTransitions[ states.PLAYHEAD ][ states.PLAY    ] = true;
    validTransitions[ states.PLAYHEAD ][ states.PAUSE   ] = true;
    validTransitions[ states.PLAYHEAD ][ states.STOP    ] = true;


    validTransitions[ states.PAUSE ] = {};
    validTransitions[ states.PAUSE ][ states.PLAY    ] = true;
    validTransitions[ states.PAUSE ][ states.STOP    ] = true;
    validTransitions[ states.PAUSE ][ states.BUFFER  ] = true;

    validTransitions[ states.STOP ]  = {};
    validTransitions[ states.STOP ][ states.PLAY ] = true;

    validTransitions[ states.STOP ]  = {};
    validTransitions[ states.STOP ][ states.PLAY ] = true;

    validTransitions[ states.BUFFER ]  = {};
    validTransitions[ states.BUFFER ][ states.PLAY ] = true;
    validTransitions[ states.BUFFER ][ states.PAUSE] = true;
    validTransitions[ states.BUFFER ][ states.STOP ] = true;


    RealTimeAnalyticsPlugin.Ooyala = function (mb, id) {
        this.mb = mb; // save message bus reference for later use
        this.id = id;
        this.currentState = null;
        this.init(); // subscribe to relevant events
    };

    // public functions of the module object
    RealTimeAnalyticsPlugin.Ooyala.prototype = {
        playerInstance : null,
        init: function () {
            try{
                this.mb.subscribe(OO.EVENTS.PLAYER_CREATED, 'RealTimeAnalytics', _.bind(this.onPlayerCreate, this));
                this.mb.subscribe(OO.EVENTS.PAUSED, 'RealTimeAnalytics', _.bind(this.onPauseHandler, this), this);
                this.mb.subscribe(OO.EVENTS.PLAYING, 'RealTimeAnalytics',  _.bind(this.onPlayHandler, this), this);
                this.mb.subscribe(OO.EVENTS.PLAYED, 'RealTimeAnalytics', _.bind(this.onStopHandler, this), this);
                this.mb.subscribe(OO.EVENTS.ERROR, 'RealTimeAnalytics', _.bind(this.onErrorHandler, this));
                this.mb.subscribe(OO.EVENTS.BUFFERED, 'RealTimeAnalytics',  _.bind(this.onBufferedHandler, this));
                this.mb.subscribe(OO.EVENTS.PLAYBACK_READY, 'RealTimeAnalytics', _.bind(this.onPlaybackReadyHandler, this));
                this.mb.subscribe(OO.EVENTS.PLAYHEAD_TIME_CHANGED, 'RealTimeAnalytics', _.bind(this.onPlayheadUpdateHandler, this));
            }catch(err){
                console.log(err);
            }
        },
        onPlayerCreate: function (event, elementId, params) {
            initialTime = new Date();
            initialTime = initialTime.getTime();
            var plugin = this;
            this.currentState = states.INIT;
            var trySend = function( intent ){
                console.log(" ooyalaPlugin :: " + "video intent data ready ["+elementId+"][" + intent + "]" );
                if( intent < RealTimeAnalyticsPluginBase.MAX_INTENTS ){
                    setTimeout( function(){
                        try{
                            if ( typeof OO.__internal.players[elementId] != 'undefined' ){
                                plugin.playerInstance = OO.__internal.players[elementId];
                                rap.sendLoad( getVidMetadata(plugin.playerInstance) );
                            } else {
                                throw "Not Ready";
                            }
                        }catch (err){
                            trySend(intent+1);
                        }
                    }, 50*intent);
                }
            }
            trySend(0);
        },
        onPlayHandler : function(event){
            if( canTransit(this.currentState, states.PLAY) ){
                rap.sendPlay( getVidMetadata(this.playerInstance) );
                this.currentState = states.PLAY;
            }
        },
        onPauseHandler : function(event){
            if( canTransit(this.currentState, states.PAUSE) ){
                rap.sendPause( getVidMetadata(this.playerInstance) );
                this.currentState = states.PAUSE;
            }
        },
        onStopHandler : function(event){
            if( canTransit(this.currentState, states.STOP) ){
                rap.sendStop( getVidMetadata(this.playerInstance) );
                this.currentState = states.STOP;
            }
        },
        onErrorHandler : function(event, errorCode){
            var metadata = getVidMetadata( this.playerInstance );
            metadata[RealTimeAnalyticsPluginBase.VIDEO_ERROR_CODE] = errorCode;
            rap.sendError( metadata );
        },
        onBufferedHandler : function(event, streamUrl){
            if( canTransit(this.currentState, states.BUFFER) ){
                rap.sendBuffer( getVidMetadata( this.playerInstance ) );
                this.currentState = states.BUFFER;
            }
        },
        onPlaybackReadyHandler : function(event, errorCode){
           var finalTime = new Date();
           finalTime = finalTime.getTime();
           var totalTime = finalTime-initialTime;
           var metadata = getVidMetadata( this.playerInstance );
           metadata[ RealTimeAnalyticsPluginBase.VIDEO_LOAD_TIME ] = totalTime;
           rap.sendLoadTime( metadata );
        },
        onPlayheadUpdateHandler : function(event, time, duration, buffer){
            if( canTransit(this.currentState, states.PLAYHEAD) ){
                rap.sendPlayHeadUpdate( getVidMetadata(this.playerInstance) );
                this.currentState = states.PLAYHEAD;
            }
        },
        __end_marker: true
    };

    function getVidMetadata ( playerInstance ){
        var vidMetadata = {};
         vidMetadata[ RealTimeAnalyticsPluginBase.VIDEO_IDENTIFIER ] = playerInstance.currentItem.embed_code ? playerInstance.currentItem.embed_code : playerInstance.currentItem.embedCode ;
         vidMetadata[ RealTimeAnalyticsPluginBase.VIDEO_NAME ]       = playerInstance.currentItem.title;
         vidMetadata[ RealTimeAnalyticsPluginBase.VIDEO_DOMAIN ]     = playerInstance.currentItem.hostedAtURL;
         vidMetadata[ RealTimeAnalyticsPluginBase.VIDEO_THUMBNAIL ]  = playerInstance.currentItem.thumbnail_image ? playerInstance.currentItem.thumbnail_image : playerInstance.currentItem.promo ;
         return vidMetadata;
    }

    function canTransit( currentState, destinationState ){
        return typeof validTransitions[ currentState ]!= 'undefined'
            && typeof validTransitions[ currentState ][ destinationState ]  != 'undefined'
            && validTransitions[ currentState ][ destinationState ];
    }

    return RealTimeAnalyticsPlugin.Ooyala;
});