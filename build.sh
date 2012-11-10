#!/bin/sh

cd $(dirname $0)

uglifyjs2 src/main.js \
	src/flash.js \
	src/html5.js \
	src/coverflow.js \
	src/cover.js \
	src/controller.js \
	src/playlistloader.js \
	src/signal.js \
	src/utils.js \
	src/modernizr.js \
	-o coverflow.js -m -c
