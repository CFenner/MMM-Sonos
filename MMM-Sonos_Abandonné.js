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
		showRoomName: true,
		animationSpeed: 1000,
		updateInterval: 0.5, // every 0.5 minutes
		apiBase: 'http://localhost',
		apiPort: 5005,
		apiEndpoint: 'zones',
 		exclude: []
	},
	start: function() {
		Log.info('Starting module: ' + this.name);
		
		var ModuleSonosHidden = false; 
		var UserPresence = true;
		var updateIntervalID = 0;
		
		this.update();
		// refresh every x minutes
/*		this.updateIntervalID = setInterval(
			this.update.bind(this),
			this.config.updateInterval * 60 * 1000);
	*/		
		this.setUpdateInterval(this.config.updateInterval);

	},
	update: function(){		
	//	Log.log("Update SONOS demandée !");		
		this.sendSocketNotification(
			'SONOS_UPDATE',
			this.config.apiBase + ":" + this.config.apiPort + "/" + this.config.apiEndpoint);
	},
	
	//Modif AgP42 - 16/07/2018	

	suspend: function() {
		this.ModuleSonosHidden = true; //Il aurait été plus propre d'utiliser this.hidden, mais comportement aléatoire...
		//Log.log("Fct suspend - ModuleHidden = " + ModuleHidden);
		this.GestionUpdateIntervalSonos(); //on appele la fonction qui gere tous les cas
	},
	
	resume: function() {
		this.ModuleSonosHidden = false;
		//Log.log("Fct resume - ModuleHidden = " + ModuleHidden);
		this.GestionUpdateIntervalSonos();	
	},

	notificationReceived: function(notification, payload) {
		if (notification === "USER_PRESENCE") { // notification envoyée par le module MMM-PIR-Sensor. Voir sa doc
			//Log.log("Fct notificationReceived USER_PRESENCE - payload = " + payload);
			UserPresence = payload;
			this.GestionUpdateIntervalSonos();
		}
	},

	GestionUpdateIntervalSonos: function() {
		if (UserPresence === true && this.ModuleSonosHidden === false){ // on s'assure d'avoir un utilisateur présent devant l'écran (sensor PIR) et que le module soit bien affiché
			var self = this;
			Log.log(this.name + " est revenu et user present ! On update");
	
			// update tout de suite
			this.update();
			//et on remet l'intervalle d'update en route, si aucun deja actif (pour éviter les instances multiples)
			if (this.updateIntervalID === 0){
			
				/*this.updateIntervalID = setInterval(
					this.update.bind(this),
					this.config.updateInterval * 60 * 1000);*/
				this.setUpdateInterval(this.config.updateInterval);
					
			}
		}else{ //sinon (UserPresence = false OU ModuleHidden = true)
			Log.log("Personne regarde : on stop l'update Sonos !");
			clearInterval(this.updateIntervalID); // on arrete l'intervalle d'update en cours
			
			Log.log("clearInterval, ID " + this.updateIntervalID);

			this.updateIntervalID=0; //on reset la variable
		}
	},
	
	setUpdateInterval: function(updateIntervalValue) {
	
		this.updateIntervalID = setInterval(
					this.update.bind(this),
					updateIntervalValue * 60 * 1000);
					
		Log.log("New updateInterval set every " + updateIntervalValue + " min. ID : " + this.updateIntervalID);
					
	},
	
	GestionRoomState: function(room, state) {
		
		//allow to change the header if define on the config.js file
		if(this.config.headerPlaying && state === 'PLAYING'){
			this.data.header = this.config.headerPlaying;
		}else if(this.config.headerStopped && state === 'STOPPED'){
			this.data.header = this.config.headerStopped;
		}
		
		if(this.config.updateIntervalPaying && state === 'PLAYING'){
			
			Log.log("Lecture en cours dans : " + room);

			clearInterval(this.updateIntervalID); // on arrete l'intervalle d'update en cours
			Log.log("clearInterval, ID " + this.updateIntervalID);

			//we set the new one
			this.setUpdateInterval(this.config.updateIntervalPaying);

				
		}else if(this.config.updateIntervalPaying && state === 'STOPPED'){
			
			Log.log("Lecture STOP dans : " + room);
			
			clearInterval(this.updateIntervalID); // on arrete l'intervalle d'update en cours
			Log.log("clearInterval, ID " + this.updateIntervalID);

			//set again normal interval
			this.setUpdateInterval(this.config.updateInterval);

		}
				
	},


	//fin modif AgP
	
	render: function(data){
		var text = '';
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
				var streamInfo = currentTrack.streamInfo;
				var type = currentTrack.type;
				

				if(track == currentTrack.uri)
					track = '';
				text += this.renderRoom(state, artist, track, cover, room);
			}
		}.bind(this));
		this.loaded = true;
		// only update dom if content changed
		if(this.dom !== text){
			this.dom = text;
			this.updateDom(this.config.animationSpeed);
		}
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
