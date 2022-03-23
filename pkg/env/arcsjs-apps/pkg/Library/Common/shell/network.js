/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {AutomergeNetwork, logFactory, utils} from '../basic.js';
import {Discovery} from '../../Firebase/endpoint/discovery.js';
import {Endpoint} from '../../Firebase/endpoint/endpoint.js';
import {FirebasePromise} from './firebase.js';
import {config} from './configuration.js';

const log = logFactory(true, logFactory.flags.network, 'olivedrab');

// ****************************************************************************************
// firebase is needed specifically for `discovery`, `persistence`, and `endpoint` libraries
// all these implementations are fungible, there is no fundamental dependency
// ****************************************************************************************

const dbRootPath = config.aeon || `blueSky/00x00`;
const discoveryNode = `discovery`;
const endpointNode = `endpoint`;

export const bootstrapNetwork = async user => {
  const nid = `${user.uid}:${utils.makeId(1, 2)}`;
  log(`bootstrapNetwork for [${nid}]`);
  await discovery(nid, user);
  await endpoint(nid, user);
  user.network = new AutomergeNetwork(nid, user);
};

export const discovery = async (nid, user) => {
  // hello discovery
  const firebase = await FirebasePromise;
  const discoveryStorage = firebase.database.ref(dbRootPath).child(discoveryNode);
  const discovery = new Discovery(discoveryStorage, nid);
  discovery.listen('discover', ({uid}) => user.addPeer(uid));
  user.discovery = discovery;
};

export const endpoint = async (nid, user) => {
  // hello endpoint
  const firebase = await FirebasePromise;
  const endpointStorage = firebase.database.ref(dbRootPath).child(endpointNode);
  const endpoint = new Endpoint(endpointStorage, nid);
  user.endpoint = endpoint;
};