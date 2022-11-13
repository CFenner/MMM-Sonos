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
    albumArtLocation: 'right',
    showRoomName: true,
    maxTextLength: undefined,
    animationSpeed: 1000,
    updateInterval: 0.5, // every 0.5 minutes
    apiBase: 'http://localhost',
    apiPort: 5005,
    apiEndpoint: 'zones',
    exclude: []
  },
  roomList: [],
  start: function () {
    Log.info('Starting module: ' + this.name)
    this.update()
    // refresh every x minutes
    setInterval(
      this.update.bind(this),
      this.config.updateInterval * 60 * 1000)
  },
  update: function () {
    this.sendSocketNotification(
      'SONOS_UPDATE',
      this.config.apiBase + ':' + this.config.apiPort + '/' + this.config.apiEndpoint)
  },
  getRoomName: function (room) {
    const roomList = []
    if (room.members.length > 1) {
      room.members.forEach(function (member) {
        if (!this.isRoomExcluded(member.roomName)) { roomList.push(member.roomName) }
      }.bind(this))
    } else {
      if (!this.isRoomExcluded(room.coordinator.roomName)) { roomList.push(room.coordinator.roomName) }
    }
    return roomList.join(', ')
  },
  isRoomExcluded: function (roomName) {
    return this.config.exclude.indexOf(roomName) !== -1
  },
  isInTVMode: function (artist, track, cover) {
    // if Sonos Playbar is in TV mode, no title is provided and therefore the room should not be displayed
    return (artist && artist.length) === 0 && (track && track.length) === 0 && (cover && cover.length) === 0
  },
  updateRoomList: function (data) {
    const roomList = []
    const maxTextLength = this.config.maxTextLength
    data.forEach(function (item) {
      const roomName = this.getRoomName(item)
      if (roomName !== '') {
        const currentTrack = item.coordinator.state.currentTrack
        let artist = currentTrack.artist
        let track = currentTrack.title
        let cover = currentTrack.absoluteAlbumArtUri
        //        var streamInfo = currentTrack.streamInfo;
        //        var type = currentTrack.type;

        // clean data
        artist = artist ? artist.trim() : ''
        track = track ? track.trim() : ''
        cover = cover ? cover.trim() : ''
        track = track === currentTrack.uri ? '' : track
        // remove stream URL from title
        if (currentTrack.trackUri && currentTrack.trackUri.includes(track)) {
          track = ''
        }

        if (maxTextLength) {
          if (artist.length > maxTextLength) {
            artist = `${artist.substring(0, maxTextLength)}...`
          }
          if (track.length > maxTextLength) {
            track = `${track.substring(0, maxTextLength)}...`
          }
        }

        roomList.push({
          name: roomName,
          state: this.isInTVMode(artist, track, cover) ? 'TV' : item.coordinator.state.playbackState,
          artist: artist,
          track: track,
          albumArt: cover
        })
      }
    }.bind(this))
    this.loaded = true
    if (JSON.stringify(this.roomList) === JSON.stringify(roomList)) {
      return
    }
    this.roomList = roomList
    this.updateDom(this.config.animationSpeed)
  },
  getStyles: function () {
    return [`${this.name}.css`]
  },
  getTemplate: function () {
    return `${this.name}.njk`
  },
  getTemplateData: function () {
    return {
      flip: this.data.position.startsWith('left'),
      loaded: this.loaded,
      showAlbumArtRight:
        this.config.showAlbumArt && this.config.albumArtLocation !== 'left',
      showAlbumArtLeft:
        this.config.showAlbumArt && this.config.albumArtLocation === 'left',
      showRoomName: this.config.showRoomName,
      showStoppedRoom: this.config.showStoppedRoom,
      roomList: this.roomList,
      labelLoading: this.translate('LOADING')
    }
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification === 'SONOS_DATA') {
      Log.debug('received SONOS_DATA')
      this.updateRoomList(payload)
    }
  }
})
