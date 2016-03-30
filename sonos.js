Module.create({
	defaults: {
		showStoppedRoom: true,
		showAlbumArt: true,
		showRoomName: true,
		fadeSpeed: 1000,
		updateInterval: 1 * 60 * 1000, // every minute
		api: {
			base: '//localhost:5005/',
			zonesEndpoint: 'zones'
		}
	},
	html: {
		loading: '<div class="dimmed light small">Loading music ...</div>',
		roomWrapper: '<li>{0}</li>',
		room: '<div class="room xsmall">{0}</div>',
		song: '<div>{0}</div>',
		name: '<div class="name normal medium"><div>{0}</div><div>{1}</div></div>',
		art: '<div class="art"><img src="{0}"/></div>'
	},
	start: function() {
		Log.info('Starting module: ' + this.name);
		this.update();
		// refresh every x minutes
		setInterval(
			this.update.bind(this), 
			this.config.updateInterval);
	},
	update: function(){
		Q.fcall(
			this.load.bind(this),
			this.error.bind(this)
		).done(
			this.render.bind(this)
		);
	},
	load: function(){
		return Q($.ajax({
			url: this.config.api.base + this.config.api.zonesEndpoint
		}));
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
			text += this.html.roomWrapper.format(
				(state === 'PLAYING'
					?this.html.song.format(
						this.html.name.format(artist, track)+
						(this.config.showAlbumArt
							?this.html.art.format(cover)
							:''
						)
						//+"<span>"+streamInfo+"</span>"
					)
					:''
				)+(this.config.showRoomName && (state === 'PLAYING' || this.config.showStoppedRoom)
					?this.html.room.format(room)
					:''
				)
			);
		}.bind(this));
		this.loaded = true;
		// only update dom if content changed
		if(this.dom !== text){
			this.dom = text;
			this.updateDom(this.config.fadeSpeed);
		}
	},
	error: function(error){
		console.log('Failure:' + error);
	},
	getScripts: function() {
		return [
			'String.format.js',
			'//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.js',
			'q.min.js',
			'moment.js',
		];
	},
	getStyles: function() {
		return [
			'sonos.css'
		];
	},
	getDom: function() {
		if (!this.loaded) {
			return $('<div class="sonos">'+this.html.loading+'</div>')[0];
		}else if(this.data.position.endsWith("left")){
			return $('<div class="sonos"><ul class="flip">'+this.dom+'</ul></div>')[0];
		}else{
			return $('<div class="sonos"><ul>'+this.dom+'</ul></div>')[0];
		}
	}
});