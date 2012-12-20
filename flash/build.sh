#!/bin/bash

cd $(dirname $0)

FLEXPATH=/Developer/SDKs/flex_sdk_4.6

echo "Compiling..."
$FLEXPATH/bin/mxmlc ./coverflow/Main.as \
	-sp ./ \
	-o ../coverflow.swf \
	-static-link-runtime-shared-libraries=true \
	-debug=false
