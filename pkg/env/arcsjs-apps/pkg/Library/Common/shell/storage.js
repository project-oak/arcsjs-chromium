/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../../../arcs-import.js';
import {FirebasePromise} from './firebase.js';
import {config} from './configuration.js';

const aeonPath = `/${config.aeon}`;
const storesPath = `${aeonPath}/cache`;

const logIn = logFactory(logFactory.flags.storage, 'storage', 'limegreen');
const logOut = logFactory(logFactory.flags.storage, 'storage', 'darkgreen');

// is a Promise
const Storage = (async () => {
  const {database} = await FirebasePromise;
  return {db: database};
})();

// Firebase disallows `[].`
const cleanKey = id => id.replace(/\[/g, '(').replace(/]/g, ')').replace(/[.]/g, '_');

// Firebase persistence for Store objects
export const FirebasePersistor = class {
  constructor(owner) {
    this.owner = owner;
  }
  get path() {
    return `${this.owner.uid}${aeonPath}`;
  }
  async getNode(id) {
    return (await Storage).db.ref(
      cleanKey(`${this.path}/${id}`)
    );
  }
  async persist(id, store) {
    if (!store.is('volatile') && store.is('persisted')) {
      const node = await this.getNode(id);
      if (node) {
        // meta has bad firebase keys ("$[name]"" is bad), safenize it
        const safeMeta = {};
        Object.entries(store.meta).forEach(([key, value]) => safeMeta[key] = JSON.stringify(value));
        const value = {
          serial: store.save() ?? null,
          meta: safeMeta
        };
        node.set(value);
        logOut(`${node.key}: serialized [${(value.serial?.length/1024 || 0).toFixed(2)}Kb]`);
      }
    }
  }
  async restore(id, store) {
    if (!store.is('volatile') && store.is('persisted')) {
      const node = await this.getNode(id);
      if (node) {
        const snap = await node.once('value');
        const value = snap.val();
        if (value && value.serial?.length && value.meta) {
          store.meta = {};
          Object.entries(value.meta).forEach(([key, value]) => store.meta[key] = JSON.parse(value));
          store.load(value.serial);
          logIn(`${node.key}: restored [${(value.serial?.length/1024).toFixed(2)}Kb]`);
          return true;
        }
      }
    }
    return false;
  }
  async remove(id, store) {
    if (!store.is('volatile') && store.is('persisted')) {
      const node = await this.getNode(id);
      if (node) {
        node.remove();
      }
      logOut(`Deleted ${node.key}.`);
    }
  }
};

// LocalStorage persistence for Store objects
export const LocalStoragePersistor = class {
  constructor(owner) {
    this.owner = owner;
  }
  get path() {
    return `${this.owner.uid}${aeonPath}`;
  }
  getKey(id) {
    return `${this.path}/${id}`;
  }
  async persist(id, store) {
    if (!store.is('volatile') && store.is('persisted')) {
      const key = this.getKey(id);
      const serial = store.save();
      if (serial) {
        logOut(`${key}: serialized [${(serial.length/1024).toFixed(2)}Kb]`);
        localStorage.setItem(key, serial);
      }
    }
  }
  async restore(id, store) {
    if (!store.is('volatile') || store.is('persisted')) {
      const key = this.getKey(id);
      const serial = localStorage.getItem(key);
      if (serial) {
        store.load(serial);
        logIn(`${key}: restored [${(serial.length/1024).toFixed(2)}Kb]`);
        return true;
      }
    }
    return false;
  }
};
