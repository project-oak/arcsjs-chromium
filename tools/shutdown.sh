# Copyright 2022 Google LLC
# 
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

PID="/tmp/arcsjs_server.pid"

if [ -f "${PID}" ]
then
  echo "shutting down the server..."
  kill $(cat "${PID}") || echo "server was not running"
  rm "${PID}"
fi
