Module.create({
	defaults: {
		updateInterval: 60000,
		fadeSpeed: 4000,
		showStoppedRoom: true,
		showAlbumArt: true,
		showRoomName: true,
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
		this.run();
		setInterval(
			this.run.bind(this), 
			this.config.updateInterval);
	},
	run: function(){
		Q.fcall(
			this.load.bind(this),
			this.error.bind(this)
		).then(
			this.render.bind(this)
		).done(function(){
			this.updateDom(this.config.fadeInterval);
		}.bind(this));
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
		this.dom = text;
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
		return $('<div class="sonos">'+(this.dom?'<ul>'+this.dom+'</ul>':this.html.loading)+'</div>')[0]; 
	}
});