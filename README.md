# MagicMirror-Sonos-Module

<p>
<a href="https://github.com/jishi/node-sonos-http-api"><img src="https://img.shields.io/badge/Sonos-API-orange.svg" alt="API"></a>
<a href="http://choosealicense.com/licenses/mit"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

This is an adaption Sonos module of [Vaggan's](https://github.com/Vaggan) [MagicMirror-SonosModule](https://github.com/Vaggan/MagicMirror-SonosModule). It was modified to fit the new module system and got some enhancements in visualisation an configuration.

![Sonos Module](https://github.com/CFenner/MagicMirror-Sonos-Module/blob/master/.github/preview.png)

## Usage

_Prerequisites_

- requires MagicMirror v2.0.0
- install and [run](https://github.com/MichMich/MagicMirror/wiki/Auto-Starting-MagicMirror) [node-sonos-http-api](https://github.com/jishi/node-sonos-http-api)

### Installation

Navigate into your MagicMirror's modules folder:

```shell
cd ~/MagicMirror/modules
```
Clone this repository:
```shell
git clone https://github.com/CFenner/MMM-Sonos
```
Navigate to the new MMM-Sonos folder and install the node dependencies.
```shell
cd MMM-Sonos/ && npm install
```
[Configure](#configuration) the module in your config.js file.

### Configuration

To run the module properly, you need to add the following data to your config.js file.

```
{
	module: 'MMM-Sonos',
	position: 'top_right', // you may choose any location
	config: {}
}
```

You also can set some options to hide different parts of the module.

| Option | Description |
|---|---|
|`showStoppedRoom`|Trigger the visualization of stopped rooms.<br><br>**Default value:** `true`|
|`showAlbumArt`|Trigger the visualization of the album art.<br><br>**Default value:** `true`|
|`showRoomName`|Trigger the visualization of the room name.<br><br>**Default value:** `true`|

### Known Issues

The module may not be able to access the data of the sonos API due to a Cross-Origin Resource Sharing (CORS) issue. This could be solved by adding the following lines to the `sonos-http-api.js` just before `res.write(new Buffer(jsonResponse));` in the sonos api. Remember to restart the service after the change.

```
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
```
