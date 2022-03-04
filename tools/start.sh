#!/bin/sh
# Copyright 2022 Google LLC
# 
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd


# trap ctrl-c and call ctrl_c()
function ctrl_c() {
  npm run shutdown
}
trap ctrl_c INT

npm run shutdown # replace existing servers

PORT=$(npm run --silent get_port)
echo "start web server (port $PORT)"
./tools/serve.sh &
sleep 3

open "http://localhost:$PORT/"
wait
