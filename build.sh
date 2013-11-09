#!/bin/sh

cd $(dirname $0)

uglifyjs src/main.js \
	src/api.js \
	src/flash.js \
	src/html5.js \
	src/coverflow.js \
	src/cover.js \
	src/controller.js \
	src/playlistloader.js \
	src/signal.js \
	src/utils.js \
	src/modernizr.js \
	-e window,document:window,document \
	-o coverflow.js -m -c
