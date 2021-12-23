[![code climate](https://codeclimate.com/github/CFenner/MMM-Sonos/badges/gpa.svg)](https://codeclimate.com/github/CFenner/MMM-Sonos)
[![API](https://img.shields.io/badge/api-Sonos-orange.svg)](https://github.com/jishi/node-sonos-http-api)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://choosealicense.com/licenses/mit/)

# MagicMirror-Sonos-Module

This is an adaption of the [MagicMirror-SonosModule](https://github.com/Vaggan/MagicMirror-SonosModule) by [Vaggan](https://github.com/Vaggan). It was modified to fit the new module system and got some enhancements in visualisation an configuration.

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
cd MMM-Sonos/ && npm install --production
```
Configure the module in your config.js file.

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

| Option | Description | Default |
|---|---|---|
|`showStoppedRoom`|Trigger the visualization of stopped rooms.|`true`|
|`showAlbumArt`|Trigger the visualization of the album art.|`true`|
|`showAlbumArtRight`|Shows the album art on the right side of title, otherwise on the left.|`true`|
|`showRoomName`|Trigger the visualization of the room name.|`true`|

### Known Issues

The module may not be able to access the data of the sonos API due to a Cross-Origin Resource Sharing (CORS) issue. This could be solved by adding the following lines to the `sonos-http-api.js` just before `res.write(new Buffer(jsonResponse));` in the sonos api. Remember to restart the service after the change.

```
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
```

### How to Install Sonos-API

To install the Sonos-API just clone the [repository](https://github.com/jishi/node-sonos-http-api) to your PI. 

```shell
git clone https://github.com/jishi/node-sonos-http-api.git
```
Navigate to the new node-sonos-http-api folder and install the node dependencies.
```shell
cd node-sonos-http-api && npm install --production
```
Now you can run the service with:

```shell
npm start
```
I really recommend to use PM2 like it is described on the MagicMirror [Wiki page](https://github.com/MichMich/MagicMirror/wiki/Auto-Starting-MagicMirror).
```shell
cd ~/Sonos
npm start
```




