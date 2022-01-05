/* Magic Mirror
 * Module: MagicMirror-Sonos-Module
 *
 * By Christopher Fenner https://github.com/CFenner
 * MIT Licensed.
 */
 Module.register('MMM-Sonos', {
	defaults: {
		showStoppedRoom: true,
		showAlbumArt: true,
		showAlbumArtRight: true,
		showRoomName: true,
		animationSpeed: 1000,
		updateInterval: 0.5, // every 0.5 minutes
		apiBase: 'http://localhost',
		apiPort: 5005,
		apiEndpoint: 'zones',
 		exclude: []
	},
	roomList: [],
	start: function() {
		Log.info('Starting module: ' + this.name);
		this.update();
		// refresh every x minutes
		setInterval(
			this.update.bind(this),
			this.config.updateInterval * 60 * 1000);
	},
	update: function(){
		this.sendSocketNotification(
			'SONOS_UPDATE',
			this.config.apiBase + ":" + this.config.apiPort + "/" + this.config.apiEndpoint);
	},
	getRoomName: function(room){
		var roomName = '';
		var isGroup = room.members.length > 1;
		if(isGroup){
                	$.each(room.members, function (j, member) {
                                var isExcluded = this.config.exclude.indexOf(member.roomName) !== -1;
                                roomName += isExcluded?'':(member.roomName + ', ');
                        }.bind(this));
                        roomName = room.replace(/, $/,"");
                }else{
                        roomName = room.coordinator.roomName;
                        var isExcluded = this.config.exclude.indexOf(room) !== -1;
                        roomName = isExcluded?'':room;
                }
		return roomName;
	},
	render: function(data){
		var text = '';
		this.roomList = [];
		$.each(data, function (i, item) {
			var room = '';
			var isGroup = item.members.length > 1;
			if(isGroup){
				$.each(item.members, function (j, member) {
					var isExcluded = this.config.exclude.indexOf(member.roomName) !== -1;
					room += isExcluded?'':(member.roomName + ', ');
				}.bind(this));
				room = room.replace(/, $/,"");
			}else{
				room = item.coordinator.roomName;
				var isExcluded = this.config.exclude.indexOf(room) !== -1;
				room = isExcluded?'':room;
			}
			if(room !== ''){
				var state = item.coordinator.state.playbackState;
				var currentTrack = item.coordinator.state.currentTrack;
				var artist = currentTrack.artist;
				var track = currentTrack.title;
				var cover = currentTrack.absoluteAlbumArtUri;
//				var streamInfo = currentTrack.streamInfo;
//				var type = currentTrack.type;

				if(track == currentTrack.uri)
					track = '';

                                this.roomList.push({
                                        'name': room,
                                        'state': state,
                                        'artist': artist?artist:"",
                                        'track': track?track:"",
                                        'albumArt': cover?cover:"",
                                });

			//	text += this.renderRoom(state, artist, track, cover, room);
			}
		}.bind(this));
		this.loaded = true;
		// only update dom if content changed
		//if(this.dom !== text){
		//	this.dom = text;
			this.updateDom(this.config.animationSpeed);
		//}
	},
	renderRoom: function(state, artist, track, cover, roomName) {
		artist = artist?artist:"";
		track = track?track:"";
		cover = cover?cover:"";
		var room = '';
		// if Sonos Playbar is in TV mode, no title is provided and therefore the room should not be displayed
		var isEmpty = (artist && artist.trim().length) == 0
			&& (track && track.trim().length) == 0
			&& (cover && cover.trim().length) == 0;
		// show song if PLAYING
		if(state === 'PLAYING' && !isEmpty) {
			room += this.html.song.format(
				// show album art if 'showAlbumArt' is set
				(this.config.showAlbumArt && !this.config.showAlbumArtRight
					?this.html.art.format(cover)
					:''
				)+
				this.html.name.format(artist, track)+
				// show album art if 'showAlbumArt' is set
				(this.config.showAlbumArt && this.config.showAlbumArtRight
					?this.html.art.format(cover)
					:''
				)
				//+"<span>"+streamInfo+"</span>"
			);
		}
		// show room name if 'showRoomName' is set and PLAYING or 'showStoppedRoom' is set
		if(this.config.showRoomName && (state === 'PLAYING' || this.config.showStoppedRoom)) {
			room += this.html.room.format(roomName);
		}
		return  this.html.roomWrapper.format(room);
	},
	getScripts: function() {
		return [
			'String.format.js',
			'//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.js'
		];
	},
	getStyles: function() {
		return ['sonos.css'];
	},
	getTemplate: function() {
		return `${this.name}.njk`;
	},
	getTemplateData: function() {
		return {
			flip: this.data.position.startsWith('left'),
			loaded: this.loaded,
			showAlbumArt: this.config.showAlbumArt,
			showRoomName: this.config.showRoomName,
			showStoppedRoom: this.config.showStoppedRoom,
			roomList: this.roomList,
		};
	},
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'SONOS_DATA') {
        		Log.info('received SONOS_DATA');
			this.render(payload);
      		}
  	}
});
