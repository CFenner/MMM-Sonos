/* Magic Mirror
 * Module: MagicMirror-Sonos-Module
 *
 * By Christopher Fenner https://github.com/CFenner
 * MIT Licensed.
 */
 Module.register('sonos', {
	defaults: {
		showStoppedRoom: true,
		showAlbumArt: true,
		showRoomName: true,
		animationSpeed: 1000,
		updateInterval: 0.5, // every 0.5 minutes
		apiBase: 'http://localhost',
		apiPort: 5005,
		apiEndpoint: 'zones'
	},
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
	render: function(data){
		var text = '';
		$.each(data, function (i, item) {
			var room = item.coordinator.roomName;
			var state = item.coordinator.state.zoneState;
			var artist = item.coordinator.state.currentTrack.artist;
			var track = item.coordinator.state.currentTrack.title;
			var cover = item.coordinator.state.currentTrack.absoluteAlbumArtURI;
			var streamInfo = item.coordinator.state.currentTrack.streamInfo;
			if(item.members.length > 1){
				room = '';
				$.each(item.members, function (j, member) {
					room += member.roomName + ', ';
				});
				room = room.slice(0, -2);
			}
			text += this.renderRoom(state, artist, track, cover, room);
		}.bind(this));
		this.loaded = true;
		// only update dom if content changed
		if(this.dom !== text){
			this.dom = text;
			this.updateDom(this.config.animationSpeed);
		}
	},
	renderRoom: function(state, artist, track, cover, roomName) {
		var room = '';
		// show song if PLAYING
		if(state === 'PLAYING') {
			room += this.html.song.format(
				this.html.name.format(artist, track)+
				// show album art if 'showAlbumArt' is set
				(this.config.showAlbumArt
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
	html: {
		loading: '<div class="dimmed light small">Loading music ...</div>',
		roomWrapper: '<li>{0}</li>',
		room: '<div class="room xsmall">{0}</div>',
		song: '<div>{0}</div>',
		name: '<div class="name normal medium"><div>{0}</div><div>{1}</div></div>',
		art: '<div class="art"><img src="{0}"/></div>'
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
	getDom: function() {
		var content = '';
		if (!this.loaded) {
			content = this.html.loading;
		}else if(this.data.position.endsWith("left")){
			content = '<ul class="flip">'+this.dom+'</ul>';
		}else{
			content = '<ul>'+this.dom+'</ul>';
		}
		return $('<div class="sonos">'+content+'</div>')[0];
	},
  socketNotificationReceived: function(notification, payload) {
      if (notification === 'SONOS_DATA') {
          Log.info('received SONOS_DATA');
					this.render(payload);
      }
  }
});
