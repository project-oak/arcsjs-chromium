/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const http = require('http');
const service = require('restana')();
const bodyParser = require('body-parser');

const subscribers = Object.create(null);
const publish = msg => Object.values(subscribers).forEach(s => s.send(msg));

const setHeaders = res => {
  console.log('setting headers');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
};

service.use((req, res, next) => {
  console.log('got request via', req.method);
  setHeaders(res);
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    next();
  }
});
service.use(bodyParser.json());

service.post('/publish', (req, res) => {
  const msg = req.body;
  console.log('publish (post)', msg);
  res.send('ok');
  publish(msg);
});

service.get('/publish', (req, res) => {
  const msg = req.query.msg;
  console.log('publish (get)', msg);
  res.send('ok');
  publish(msg);
});

service.get('/subscribe', (req, res) => {
  const id = Math.random();
  subscribers[id] = res;
  console.log('subscribed', id);
  req.on('close', () => {
    delete subscribers[id];
    console.log('removed', id, '# clients: ', Object.values(subscribers).length);
  });
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
});

http.createServer(service).listen(3000, '0.0.0.0', function () {
  console.log('running');
});
