# Copyright (c) 2022 Google LLC All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

PID="/tmp/arcsjs_server.pid"

if [ -f "${PID}" ]
then
  echo "shutting down the server..."
  kill $(cat "${PID}") || echo "server was not running"
  rm "${PID}"
fi
