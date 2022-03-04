#!/bin/sh
# Copyright 2022 Google LLC
# 
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

clear
set -m # enable job control
PORT=$(npm run --silent get_port)

cd app
node ./node_modules/local-web-server/bin/cli.js -p $PORT "$@" &

echo $! >> /tmp/arcsjs_server.pid
fg # wait on the server
