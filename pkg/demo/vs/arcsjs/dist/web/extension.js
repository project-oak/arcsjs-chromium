/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.utils = exports.Paths = exports.logFactory = void 0;
__exportStar(__webpack_require__(3), exports);
__exportStar(__webpack_require__(5), exports);
__exportStar(__webpack_require__(12), exports);
__exportStar(__webpack_require__(4), exports);
__exportStar(__webpack_require__(8), exports);
__exportStar(__webpack_require__(11), exports);
__exportStar(__webpack_require__(14), exports);
__exportStar(__webpack_require__(15), exports);
__exportStar(__webpack_require__(19), exports);
__exportStar(__webpack_require__(20), exports);
__exportStar(__webpack_require__(21), exports);
__exportStar(__webpack_require__(23), exports);
const utils = __webpack_require__(25);
exports.utils = utils;
const { logFactory, Paths } = utils;
exports.logFactory = logFactory;
exports.Paths = Paths;
const root = "file:///Users/cromwellian/current/arcsjs-chromium/pkg/demo/vs/arcsjs/src/web/arcs.ts".split('/').slice(0, -1).join('/');
Paths.setRoot(root);


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Runtime": () => (/* binding */ Runtime)
/* harmony export */ });
/* harmony import */ var _core_Arc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _core_Host_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var _core_Store_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _core_EventEmitter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _utils_id_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(13);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */






const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_4__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_4__.logFactory.flags.runtime, 'runtime', 'forestgreen');
const particleFactoryCache = {};
const storeFactories = {};
const { keys } = Object;
class Runtime extends _core_EventEmitter_js__WEBPACK_IMPORTED_MODULE_3__.EventEmitter {
    log;
    uid; // user id
    nid; // network id
    arcs;
    peers;
    shares;
    stores;
    endpoint;
    network;
    surfaces;
    persistor;
    prettyUid;
    static securityLockdown;
    static particleIndustry;
    static particleOptions;
    constructor(uid) {
        uid = uid || 'user';
        super();
        this.arcs = {};
        this.surfaces = {};
        this.stores = {};
        this.peers = new Set();
        this.shares = new Set();
        this.log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_4__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_4__.logFactory.flags.runtime, `runtime:[${this.prettyUid}]`, 'forestgreen');
        this.setUid(uid);
        Runtime.securityLockdown?.(Runtime.particleOptions);
    }
    setUid(uid) {
        this.uid = uid;
        this.nid = `${uid}:${(0,_utils_id_js__WEBPACK_IMPORTED_MODULE_5__.makeId)(1, 2)}`;
        this.prettyUid = uid.substring(0, uid.indexOf('@') + 1);
    }
    async bootstrapArc(name, meta, surface, service) {
        // make an arc on `surface`
        const arc = new _core_Arc_js__WEBPACK_IMPORTED_MODULE_0__.Arc(name, meta, surface);
        // install service handler
        arc.hostService = this.serviceFactory(service);
        // add `arc` to runtime
        await this.addArc(arc);
        // fin
        return arc;
    }
    serviceFactory(service) {
        return async (host, request) => await service.handle(this, host, request);
    }
    async bootstrapParticle(arc, id, meta) {
        // make a host
        const host = new _core_Host_js__WEBPACK_IMPORTED_MODULE_1__.Host(id);
        // make a particle
        await this.marshalParticle(host, meta);
        // add `host` to `arc`
        const promise = arc.addHost(host);
        // report
        log(host);
        // we'll call you when it's ready
        return promise;
    }
    // no-op surface mapping
    addSurface(id, surface) {
        this.surfaces[id] = surface;
    }
    getSurface(id) {
        return this.surfaces[id];
    }
    // map arcs by arc.id
    addArc(arc) {
        const { id } = arc;
        if (id && !this.arcs[id]) {
            return this.arcs[id] = arc;
        }
        throw `arc has no id, or id ["${id}"] is already in use `;
    }
    // create a particle inside of host
    async marshalParticle(host, particleMeta) {
        const particle = await this.createParticle(host, particleMeta.kind);
        host.installParticle(particle, particleMeta);
    }
    // map a store by a Runtime-specific storeId
    // Stores have no intrinsic id
    addStore(storeId, store) {
        // if the store needs to discuss things with Runtime
        // TODO(sjmiles): this is likely unsafe for re-entry
        if (store.marshal) {
            store.marshal(this);
        }
        // override the Store's own persistor to use the runtime persistor
        // TODO(sjmiles): why?
        if (store.persistor) {
            store.persistor.persist = store => this.persistor?.persist(storeId, store);
        }
        // bind this.storeChanged to store.change (and name the binding)
        const name = `${this.nid}:${storeId}-changed`;
        const onChange = this.storeChanged.bind(this, storeId);
        store.listen('change', onChange, name);
        // map the store
        this.stores[storeId] = store;
        // evaluate for sharing
        this.maybeShareStore(storeId);
        // notify listeners that a thing happened
        // TODO(sjmiles): makes no sense without id
        //this.fire('store-added', store);
    }
    storeChanged(storeId, store) {
        this.log('storeChanged', storeId);
        this.network?.invalidatePeers(storeId);
        this.onStoreChange(storeId, store);
        this.fire('store-changed', store);
    }
    // TODO(sjmiles): evacipate this method
    onStoreChange(storeId, store) {
        // override for bespoke response
    }
    do(storeId, task) {
        task(this.stores[storeId]);
    }
    removeStore(storeId) {
        this.do(storeId, store => {
            store?.unlisten('change', `${this.nid}:${storeId}-changed`);
        });
        delete this.stores[storeId];
    }
    maybeShareStore(storeId) {
        this.do(storeId, store => {
            if (store?.is('shared')) {
                this.shareStore(storeId);
            }
        });
    }
    addPeer(peerId) {
        this.peers.add(peerId);
        [...this.shares].forEach(storeId => this.maybeShareStoreWithPeer(storeId, peerId));
    }
    shareStore(storeId) {
        this.shares.add(storeId);
        [...this.peers].forEach(peerId => this.maybeShareStoreWithPeer(storeId, peerId));
    }
    maybeShareStoreWithPeer(storeId, peerId) {
        this.do(storeId, store => {
            const nid = this.uid.replace(/\./g, '_');
            if (!store.is('private') || (peerId.startsWith(nid))) {
                this.shareStoreWithPeer(storeId, peerId);
            }
        });
    }
    shareStoreWithPeer(storeId, peerId) {
        this.network?.shareStore(storeId, peerId);
    }
    async createParticle(host, kind) {
        try {
            const factory = await this.marshalParticleFactory(kind);
            return factory(host);
        }
        catch (x) {
            log.error(`createParticle(${kind}):`, x);
        }
    }
    async marshalParticleFactory(kind) {
        return particleFactoryCache[kind] ?? this.lateBindParticle(kind);
    }
    async lateBindParticle(kind) {
        return Runtime.registerParticleFactory(kind, Runtime?.particleIndustry(kind, Runtime.particleOptions));
    }
    static registerParticleFactory(kind, factoryPromise) {
        return particleFactoryCache[kind] = factoryPromise;
    }
    requireStore(meta) {
        let store = this.stores[meta.name];
        if (!store) {
            store = this.createStore(meta);
            this.addStore(meta.name, store);
        }
        return store;
    }
    createStore(meta) {
        const key = keys(storeFactories).find(tag => meta.tags?.includes?.(tag));
        const storeClass = storeFactories[key] || _core_Store_js__WEBPACK_IMPORTED_MODULE_2__.Store;
        return new storeClass(meta);
    }
    static registerStoreClass(tag, storeClass) {
        storeFactories[tag] = storeClass;
    }
}


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Arc": () => (/* binding */ Arc)
/* harmony export */ });
/* harmony import */ var _EventEmitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


const customLogFactory = (id) => (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory.flags.arc, `Arc (${id})`, 'slateblue');
const { keys, entries, values, create } = Object;
const nob = () => create(null);
class Arc extends _EventEmitter_js__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    log;
    id;
    meta;
    stores;
    hosts;
    surface;
    composer;
    hostService;
    constructor(id, meta, surface) {
        super();
        this.id = id;
        this.meta = meta;
        this.surface = surface;
        this.hosts = nob();
        this.stores = nob();
        this.log = customLogFactory(id);
    }
    async addHost(host, surface) {
        // to support hosts we need a composer
        await this.ensureComposer();
        // bookkeep
        this.hosts[host.id] = host;
        host.arc = this;
        // support per host surfacing?
        //await host.bindToSurface(surface ?? this.surface);
        // begin work
        this.updateHost(host);
        return host;
    }
    async ensureComposer() {
        if (!this.composer && this.surface) {
            // create composer
            this.composer = await this.surface.createComposer('root');
            // pipeline for events from composer to this.onevent
            // TODO(sjmiles): use 'bind' to avoid a closure and improve the stack trace
            this.composer.onevent = this.onevent.bind(this);
        }
    }
    removeHost(id) {
        this.hosts[id]?.detach();
        delete this.hosts[id];
    }
    addStore(storeId, store) {
        if (store && !this.stores[storeId]) {
            this.stores[storeId] = store;
            store.listen('change', () => this.storeChanged(storeId, store));
        }
    }
    removeStore(storeId) {
        if (this.stores[storeId]) {
            // TODO(sjmiles): must `unlisten` to match `listen` above
            //this.stores[storeId].onChange = null;
        }
        delete this.stores[storeId];
    }
    // TODO(sjmiles): 2nd param is used in overrides, make explicit
    storeChanged(storeId, store) {
        this.log(`storeChanged: "${storeId}"`);
        values(this.hosts).forEach((host) => {
            const bindings = host.meta?.bindings;
            const inputs = host.meta?.inputs;
            const isBoundBackwardCompatible = (bindings) => bindings && entries(bindings).some(([n, v]) => (v || n) === storeId);
            const isBound = (inputs) => inputs && inputs.some(input => values(input)[0] == storeId || keys(input)[0] == storeId);
            if (isBoundBackwardCompatible(bindings) || isBound(inputs)) {
                this.log(`host "${host.id}" has interest in "${storeId}"`);
                // TODO(sjmiles): we only have to update inputs for storeId, we lose efficiency here
                this.updateHost(host);
            }
        });
        this.fire('store-changed', storeId);
    }
    updateHost(host) {
        host.inputs = this.computeInputs(host);
    }
    // TODO(sjmiles): debounce? (update is sync-debounced already)
    // complement to `assignOutputs`
    computeInputs(host) {
        const inputs = nob();
        const bindings = host.meta?.bindings;
        const inputBindings = host.meta?.inputs;
        const staticInputs = host.meta?.staticInputs;
        if (bindings) {
            keys(bindings).forEach(name => this.computeInputBackwardCompatibile(name, bindings, staticInputs, inputs));
        }
        if (inputBindings) {
            inputBindings.forEach(input => this.computeInput(entries(input)[0], staticInputs, inputs));
        }
        if (bindings || inputBindings) {
            this.log(`computeInputs(${host.id}) =`, inputs);
        }
        return inputs;
    }
    computeInputBackwardCompatibile(name, bindings, staticInputs, inputs) {
        // TODO(sjmiles): implement _conditional_ bindings that are dynamic at runtime to allow directing data flow (c.f. FooImageRef)
        const storeName = bindings[name] || name;
        // find referenced store
        const store = this.stores[storeName];
        if (store) {
            //this.log(`computeInputs: using "${storeName}" (bound to "${name}")`);
            inputs[name] = store.pojo;
        }
        else {
            this.log.error(`computeInput: "${storeName}" (bound to "${name}") not found`);
        }
        if (!(inputs[name]?.length > 0) && staticInputs?.[name]) {
            inputs[name] = staticInputs[name];
        }
    }
    computeInput([name, binding], staticInputs, inputs) {
        const storeName = binding || name;
        // TODO(sjmiles): implement _conditional_ bindings that are dynamic at runtime to allow directing data flow (c.f. FooImageRef)
        // find referenced store
        const store = this.stores[storeName];
        if (store) {
            //this.log(`computeInputs: using "${storeName}" (bound to "${name}")`);
            inputs[name] = store.pojo;
        }
        else {
            this.log.error(`computeInput: "${storeName}" (bound to "${name}") not found`);
        }
        if (!(inputs[name]?.length > 0) && staticInputs?.[name]) {
            inputs[name] = staticInputs[name];
        }
    }
    // complement to `computeInputs`
    assignOutputs({ id, meta }, outputs) {
        const names = keys(outputs);
        if ((meta?.bindings || meta?.outputs) && names.length) {
            //this.log.group(`assignOutputs(${host.id}, {${keys}})`);
            //this.log(`[start][${id}] assignOutputs({${names}})`);
            names.forEach(name => this.assignOutput(name, this.stores, outputs[name], meta.bindings, meta.outputs));
            //this.log.groupEnd();
            this.log(`[end][${id}] assignOutputs:`, outputs);
        }
    }
    assignOutput(name, stores, output, bindings, outputs) {
        if (output !== undefined) {
            const binding = bindings?.[name] || this.findOutputByName(outputs, name) || name;
            // this.log(`assignOutputs: property "${name}" is bound to store "${binding}"`);
            const store = stores[binding];
            if (!store) {
                if (bindings?.[name] || outputs?.[name]) {
                    this.log.warn(`assignOutputs: no "${binding}" store for output "${name}"`);
                }
            }
            else {
                // Note: users can mess up output data in any way they see fit, so we should
                // probably invent `outputCleansing`.
                this.log(`assignOutputs: "${name}" is dirty, updating Store "${binding}"`, output);
                store.data = output;
            }
        }
    }
    findOutputByName(outputs, name) {
        const output = outputs?.find(output => keys(output)[0] === name);
        if (output) {
            return values(output)[0];
        }
    }
    async render(packet) {
        if (this.composer) {
            this.composer.render(packet);
        }
        else {
            this.log('render called, but composer is null', packet);
        }
    }
    onevent(pid, eventlet) {
        const host = this.hosts[pid];
        if (host) {
            host.handleEvent(eventlet);
        }
    }
    async service(host, request) {
        let result = await this.surface?.service(request);
        if (result === undefined) {
            result = this.hostService?.(host, request);
        }
        return result;
    }
}


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventEmitter": () => (/* binding */ EventEmitter)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
class EventEmitter {
    // map of event name to listener array
    listeners = {};
    getEventListeners(eventName) {
        return this.listeners[eventName] || (this.listeners[eventName] = []);
    }
    fire(eventName, ...args) {
        const listeners = this.getEventListeners(eventName);
        if (listeners?.forEach) {
            listeners.forEach(listener => listener(...args));
        }
    }
    listen(eventName, listener, listenerName) {
        const listeners = this.getEventListeners(eventName);
        listeners.push(listener);
        listener._name = listenerName || '(unnamed listener)';
        return listener;
    }
    unlisten(eventName, listener) {
        const list = this.getEventListeners(eventName);
        const index = (typeof listener === 'string') ? list.findIndex(l => l._name === listener) : list.indexOf(listener);
        if (index >= 0) {
            list.splice(index, 1);
        }
        else {
            console.warn('failed to unlisten from', eventName);
        }
    }
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "logFactory": () => (/* binding */ logFactory)
/* harmony export */ });
/* harmony import */ var _types_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const { fromEntries } = Object;
const _logFactory = (enable, preamble, color, kind = 'log') => {
    if (!enable) {
        return () => { };
    }
    if (kind === 'dir') {
        return console.dir.bind(console);
    }
    const style = `background: ${color || 'gray'}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
    return console[kind].bind(console, `%c${preamble}`, style);
};
const logFactory = (enable, preamble, color = '') => {
    const debugLoggers = fromEntries(_types_js__WEBPACK_IMPORTED_MODULE_0__.logKinds.map(kind => [kind, _logFactory(enable, preamble, color, kind)]));
    const errorLoggers = fromEntries(_types_js__WEBPACK_IMPORTED_MODULE_0__.errKinds.map(kind => [kind, _logFactory(true, preamble, color, kind)]));
    const loggers = { ...debugLoggers, ...errorLoggers };
    // Inject `log` as default, keeping all loggers available to be invoked by name.
    const log = loggers.log;
    Object.assign(log, loggers);
    return log;
};
logFactory.flags = globalThis.config.logFlags || {};


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "errKinds": () => (/* binding */ errKinds),
/* harmony export */   "logKinds": () => (/* binding */ logKinds)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const logKinds = ['log', 'group', 'groupCollapsed', 'groupEnd', 'dir'];
const errKinds = ['warn', 'error'];


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Host": () => (/* binding */ Host)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _utils_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _utils_rand_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _EventEmitter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _Decorator_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */





const { entries } = Object;
const customLogFactory = (id) => (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.host, `Host (${id})`, (0,_utils_rand_js__WEBPACK_IMPORTED_MODULE_2__.arand)(['#5a189a', '#51168b', '#48137b', '#6b2fa4', '#7b46ae', '#3f116c']));
/**
 * Host owns metadata (e.g. `id`, `container`) that its Particle is not allowed to access.
 * Host knows how to talk, asynchronously, to its Particle (potentially using a bus).
**/
/* TODO(sjmiles):
Update Cycle Documented Briefly
1. when a Store changes it invokes it's listeners
2. when an Arc hears a Store change, it updates Hosts bound to the Store
3. Arc updates Host by creating an `inputs` object from Stores and metadata
   - ignores fact inputs are accumulated
   - ignores information about which Store has updated
4. `inputs` object is assigned to `hosts.inputs` 🙃
5. Host does an expensive `deepEqual` equality check. Turning on `host` logging should reveal `this.log('inputs are not interesting, skipping update');` if data is caught in this trap
   - we can use reference testing here if we are more careful
     about using immutable data
6. the particle.inputs are assigned (but is really a *merge*)
*/
class Host extends _EventEmitter_js__WEBPACK_IMPORTED_MODULE_3__.EventEmitter {
    arc;
    composer;
    id;
    lastOutput;
    log;
    meta;
    particle;
    constructor(id) {
        super();
        this.log = customLogFactory(id);
        this.id = id;
    }
    async bindToSurface(surface, rootSlot = 'root') {
        // create composer
        this.composer = await surface.createComposer(rootSlot);
        // set up pipeline for events from surface to arc
        this.composer.onevent = this.onevent.bind(this);
    }
    onevent(eventlet) {
        this.arc?.onevent(eventlet);
    }
    // Particle and ParticleMeta are separate, host specifically integrates these on behalf of Particle
    installParticle(particle, meta) {
        if (this.particle) {
            this.detachParticle();
        }
        if (particle) {
            this.particle = particle;
            this.meta = meta || this.meta;
        }
    }
    get container() {
        return this.meta?.container || 'root';
    }
    detach() {
        this.detachParticle();
        this.arc = null;
    }
    detachParticle() {
        const { particle } = this;
        if (particle) {
            this.render({ $clear: true });
            this.particle = null;
            this.meta = null;
        }
    }
    async service(request) {
        if (request?.decorate) {
            return _Decorator_js__WEBPACK_IMPORTED_MODULE_4__.Decorator.maybeDecorateModel(request.model, this.particle);
        }
        return this.arc?.service(this, request);
    }
    output(outputModel, renderModel) {
        if (outputModel) {
            this.lastOutput = outputModel;
            this.arc?.assignOutputs(this, outputModel);
        }
        if (this.template) {
            _Decorator_js__WEBPACK_IMPORTED_MODULE_4__.Decorator.maybeDecorateModel(renderModel, this.particle);
            this.log(renderModel);
            this.render(renderModel);
        }
    }
    render(model) {
        const { id, container, template } = this;
        this.arc?.render({ id, container, content: { template, model } });
    }
    //   protected trap(func) {
    // //    try {
    //       return func();
    // //    } catch(x) {
    // //      throw x;
    // //    }
    //   }
    set inputs(inputs) {
        if (this.particle && inputs) {
            const lastInputs = this.particle.internal.inputs;
            if (this.dirtyCheck(inputs, lastInputs, this.lastOutput)) {
                this.particle.inputs = { ...this.meta?.staticInputs, ...inputs };
                this.fire('inputs-changed');
            }
            else {
                this.log('inputs are uninteresting, skipping update');
            }
        }
    }
    dirtyCheck(inputs, lastInputs, lastOutput) {
        const dirtyBits = ([n, v]) => (lastOutput?.[n] && !(0,_utils_object_js__WEBPACK_IMPORTED_MODULE_1__.deepEqual)(lastOutput[n], v))
            || !(0,_utils_object_js__WEBPACK_IMPORTED_MODULE_1__.deepEqual)(lastInputs?.[n], v);
        return !lastInputs
            || entries(inputs).some(dirtyBits);
    }
    get config() {
        return this.particle?.config;
    }
    get template() {
        return this.config?.template;
    }
    invalidate() {
        this.particle?.invalidate();
    }
    handleEvent(eventlet) {
        return this.particle?.handleEvent(eventlet);
    }
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "deepCopy": () => (/* binding */ deepCopy),
/* harmony export */   "deepEqual": () => (/* binding */ deepEqual),
/* harmony export */   "deepUndefinedToNull": () => (/* binding */ deepUndefinedToNull),
/* harmony export */   "shallowMerge": () => (/* binding */ shallowMerge),
/* harmony export */   "shallowUpdate": () => (/* binding */ shallowUpdate)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/*
 * update the fields of `obj` with the fields of `data`,
 * perturbing `obj` as little as possible (since it might be a magic proxy thing
 * like an Automerge document)
 */
const shallowUpdate = (obj, data) => {
    let result = data;
    if (!data) {
        //
    }
    else if (Array.isArray(data)) {
        if (!Array.isArray(obj)) {
            // TODO(sjmiles): eek, very perturbing to obj
            obj = [];
        }
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            if (obj[i] !== value) {
                obj[i] = value;
            }
        }
        const overage = obj.length - data.length;
        if (overage > 0) {
            obj.splice(data.length, overage);
        }
    }
    else if (typeof data === 'object') {
        result = (obj && typeof obj === 'object') ? obj : Object.create(null);
        const seen = {};
        // for each key in input data ...
        Object.keys(data).forEach(key => {
            // copy that data into output
            result[key] = data[key];
            // remember the key
            seen[key] = true;
        });
        // for each key in the output data...
        Object.keys(result).forEach(key => {
            // if this key was not in the input, remove it
            if (!seen[key]) {
                delete result[key];
            }
        });
    }
    return result;
};
const shallowMerge = (obj, data) => {
    if (data == null) {
        return null;
    }
    if (typeof data === 'object') {
        const result = (obj && typeof obj === 'object') ? obj : Object.create(null);
        Object.keys(data).forEach(key => result[key] = data[key]);
        return result;
    }
    return data;
};
function deepCopy(datum) {
    if (!datum) {
        return datum;
    }
    else if (Array.isArray(datum)) {
        // This is trivially type safe but tsc cannot prove it so we have to 'promise'.
        return datum.map(element => deepCopy(element));
    }
    else if (typeof datum === 'object') {
        const clone = Object.create(null);
        Object.entries(datum).forEach(([key, value]) => {
            clone[key] = deepCopy(value);
        });
        return clone;
    }
    else {
        return datum;
    }
}
;
const deepEqual = (a, b) => {
    const type = typeof a;
    // must be same type to be equal
    if (type !== typeof b) {
        return false;
    }
    // we are `deep` because we recursively study object types
    if (type === 'object' && a && b) {
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);
        // equal if same # of props, and no prop is not deepEqual
        return (aProps.length == bProps.length) && !aProps.some(name => !deepEqual(a[name], b[name]));
    }
    // finally, perform simple comparison
    return (a === b);
};
const deepUndefinedToNull = (obj) => {
    if (obj === undefined) {
        return null;
    }
    if (obj && (typeof obj === 'object')) {
        // we are `deep` because we recursively study object types
        const props = Object.getOwnPropertyNames(obj);
        props.forEach(name => {
            const prop = obj[name];
            if (prop === undefined) {
                delete obj[name];
                //obj[name] = null;
            }
            else {
                deepUndefinedToNull(prop);
            }
        });
    }
    return obj;
};


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "arand": () => (/* binding */ arand),
/* harmony export */   "irand": () => (/* binding */ irand),
/* harmony export */   "key": () => (/* binding */ key),
/* harmony export */   "prob": () => (/* binding */ prob)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const { floor, pow, random } = Math;
// random n-digit number
const key = (digits) => floor((1 + random() * 9) * pow(10, digits - 1));
// random integer from [0..range)
const irand = (range) => floor(random() * range);
// random element from array
const arand = (array) => array[irand(array.length)];
// test if event has occured, where `probability` is between [0..1]
const prob = (probability) => Boolean(random() < probability);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Decorator": () => (/* binding */ Decorator)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _utils_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.decorator, 'Decorator', 'plum');
const { values, entries } = Object;
const opaqueData = {};
const Decorator = {
    setOpaqueData(name, data) {
        opaqueData[name] = data;
        return name;
    },
    getOpaqueData(name) {
        return opaqueData[name];
    },
    maybeDecorateModel(model, particle) {
        if (model && !Array.isArray(model)) {
            // for each item in model, regardless of key
            values(model).forEach((item) => {
                // is an object?
                if (item && (typeof item === 'object')) {
                    // are there sub-models
                    if (item['models']) {
                        // the decorate this item
                        log('applying decorator(s) to list:', item);
                        this.maybeDecorateItem(item, particle);
                    }
                    else {
                        // otherwise, check if there are sub-items to decorate
                        if (model?.filter || model?.decorator || model?.collateBy) {
                            log('scanning for lists in sub-model:', item);
                            this.maybeDecorateModel(item, particle);
                        }
                    }
                }
            });
        }
        // possibly decorated model
        return model;
    },
    maybeDecorateItem(item, particle) {
        let models = (typeof item.models === 'string') ? this.getOpaqueData(item.models) : item.models;
        // do a decorator
        models = maybeDecorate(models, item.decorator, particle);
        // do a filter
        models = maybeFilter(models, item.filter, particle.impl);
        // do a collator
        models = maybeCollateBy(models, item);
        // mutate items
        item.models = models;
        //console.log(JSON.stringify(models, null, '  '));
    },
};
const maybeDecorate = (models, decorator, particle) => {
    decorator = particle.impl[decorator] ?? decorator;
    const { inputs, state } = particle.internal;
    if (decorator) {
        // we don't want the decorator to have access to mutable globals
        const immutableState = Object.freeze((0,_utils_object_js__WEBPACK_IMPORTED_MODULE_1__.deepCopy)(state));
        // models become decorous
        models = models.map(model => {
            // use previously mutated data or initialize
            // TODO(cromwellian): I'd like to do Object.freeze() here
            model.privateData = model.privateData || {};
            const decorated = decorator(model, inputs, immutableState);
            // set new privateData from returned
            model.privateData = decorated.privateData;
            return { ...decorated, ...model };
        });
        // sort (possible that all values undefined)
        models.sort(sortByLc('sortKey'));
        log('decoration was performed');
    }
    //models.forEach(model => delete model.privateData);
    return models;
};
const maybeFilter = (models, filter, impl) => {
    filter = impl[filter] ?? filter;
    if (filter && models) {
        // models become filtrated
        models = models.filter(filter);
    }
    return models;
};
const maybeCollateBy = (models, item) => {
    // construct requested sub-lists
    entries(item).forEach(([name, collator]) => {
        // generate named collations for items of the form `[name]: {collateBy}`
        if (collator?.['collateBy']) {
            // group the models into buckets based on the model-field named by `collateBy`
            const collation = collate(models, collator['collateBy']);
            models = collationToRenderModels(collation, name, collator['$template']);
        }
    });
    return models;
};
const sortByLc = key => (a, b) => sort(String(a[key]).toLowerCase(), String(b[key]).toLowerCase());
//const sortBy = key => (a, b) => sort(a[key], b[key]);
const sort = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const collate = (models, collateBy) => {
    const collation = {};
    models.forEach(model => {
        const keyValue = model[collateBy];
        if (keyValue) {
            const category = collation[keyValue] || (collation[keyValue] = []);
            category.push(model);
        }
    });
    return collation;
};
const collationToRenderModels = (collation, name, $template) => {
    return entries(collation).map(([key, models]) => ({
        key,
        [name]: { models, $template },
        single: !(models['length'] !== 1),
        ...models?.[0]
    }));
};


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Store": () => (/* binding */ Store)
/* harmony export */ });
/* harmony import */ var _EventEmitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _utils_object_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _utils_rand_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */



const { values, keys, entries } = Object;
const { stringify } = JSON;
class RawStore extends _EventEmitter_js__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    _data;
    constructor() {
        super();
        this._data = {};
    }
    toString() {
        return this.pretty;
    }
    get data() {
        return this._data;
    }
    set data(data) {
        this.change(doc => doc._data = data);
    }
    get isObject() {
        return this.data && typeof this.data === 'object';
    }
    get pojo() {
        return this.data;
    }
    get json() {
        return stringify(this.data);
    }
    get pretty() {
        const sorted = {};
        this.keys.sort().forEach(key => sorted[key] = this.get(key));
        return stringify(sorted, null, '  ');
    }
    get keys() {
        return keys(this.data);
    }
    get length() {
        return keys(this.data).length;
    }
    get values() {
        return values(this.data);
    }
    get entries() {
        return entries(this.data);
    }
    change(mutator) {
        mutator(this);
        this.doChange();
    }
    doChange() {
        this.fire('change', this);
        this.onChange(this);
    }
    set(key, value) {
        if (value !== undefined) {
            this.change(doc => doc.data[key] = value);
        }
        else {
            this.delete(key);
        }
    }
    push(...values) {
        const keyString = () => `key_${(0,_utils_rand_js__WEBPACK_IMPORTED_MODULE_2__.key)(12)}`;
        this.change(doc => values.forEach(value => doc.data[keyString()] = value));
    }
    removeValue(value) {
        this.entries.find(([key, entry]) => {
            if (entry === value) {
                this.delete(key);
                return true;
            }
        });
    }
    has(key) {
        return this.data[key] !== undefined;
    }
    get(key) {
        return this.data[key];
    }
    getByIndex(index) {
        return this.data[this.keys[index]];
    }
    delete(key) {
        this.change(doc => doc.data?.[key] && delete doc.data[key]);
    }
    deleteByIndex(index) {
        this.delete(this.keys[index]);
    }
    assign(dictionary) {
        this.change(doc => (0,_utils_object_js__WEBPACK_IMPORTED_MODULE_1__.shallowMerge)(doc.data, dictionary));
    }
    clear() {
        this.change(doc => doc.data = {});
    }
    onChange(store) {
    }
}
class Store extends RawStore {
    meta;
    persistor;
    willPersist = false;
    constructor(meta) {
        super();
        this.meta = meta || {};
    }
    toString() {
        return `${JSON.stringify(this.meta, null, '  ')}, ${this.pretty}`;
    }
    isCollection() {
        return this.meta.type?.[0] === '[';
    }
    get tags() {
        return this.meta.tags || (this.meta.tags = []);
    }
    is(...tags) {
        // false if any member of `tags` in not also in `this.tags`
        return !tags.find(tag => !this.tags.includes(tag));
    }
    async doChange() {
        super.doChange();
        // do not await
        this.persist();
    }
    async persist() {
        // persists at most every 500ms
        if (!this.willPersist && this.persistor) {
            this.willPersist = true;
            setTimeout(() => {
                this.willPersist = false;
                this.persistor.persist(this);
            }, 500);
        }
    }
    async restore(value) {
        const restored = await this.persistor?.restore(this);
        if (!restored) {
            this.data = value !== undefined ? value : this.getDefaultValue();
        }
    }
    getDefaultValue() {
        return this.isCollection() ? {} : '';
    }
    async remove() {
        this.persistor?.remove(this);
    }
    save() {
        return this.json;
    }
    load(value) {
        try {
            this.data = JSON.parse(value);
        }
        catch (x) {
            //
        }
    }
}


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeId": () => (/* binding */ makeId)
/* harmony export */ });
/* harmony import */ var _rand_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const makeId = (pairs, digits, delim) => {
    pairs = pairs || 2;
    digits = digits || 2;
    delim = delim || '-';
    const min = Math.pow(10, digits - 1);
    const range = Math.pow(10, digits) - min;
    const result = [];
    for (let i = 0; i < pairs; i++) {
        result.push(`${(0,_rand_js__WEBPACK_IMPORTED_MODULE_0__.irand)(range - min) + min}`);
    }
    return result.join(delim);
};


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Chef": () => (/* binding */ Chef)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _RecipeParser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(15);
/* harmony import */ var _StoreCook_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(16);
/* harmony import */ var _ParticleCook_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(18);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */




const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.recipe, 'Chef', '#087f23');
class Chef {
    static async execute(recipe, runtime, arc) {
        if (arc instanceof Promise) {
            log.error('`arc` must be an Arc, not a Promise. Make sure `boostrapArc` is awaited.');
            return;
        }
        //log.groupCollapsed('executing recipe...', recipe.$meta);
        log('---> executing recipe: ', recipe.$meta);
        const plan = new _RecipeParser_js__WEBPACK_IMPORTED_MODULE_1__.Parser(recipe);
        // `store` preparation
        await _StoreCook_js__WEBPACK_IMPORTED_MODULE_2__.StoreCook.execute(runtime, arc, plan);
        // `particle` preparation
        await _ParticleCook_js__WEBPACK_IMPORTED_MODULE_3__.ParticleCook.execute(runtime, arc, plan);
        // seasoning
        // TODO(sjmiles): what do we use this for?
        arc.meta = { ...arc.meta, ...plan.meta };
        log('===| recipe complete: ', recipe.$meta);
        //log.groupEnd();
    }
    static async evacipate(recipe, runtime, arc) {
        //log.groupCollapsed('evacipating recipe...', recipe.$meta);
        log('---> evacipating recipe: ', recipe.$meta);
        // TODO(sjmiles): this is work we already did
        const plan = new _RecipeParser_js__WEBPACK_IMPORTED_MODULE_1__.Parser(recipe);
        // `store` work
        // TODO(sjmiles): not sure what stores are unique to this plan
        //await StoreCook.evacipate(runtime, arc, plan);
        // `particle` work
        await _ParticleCook_js__WEBPACK_IMPORTED_MODULE_3__.ParticleCook.evacipate(runtime, arc, plan);
        // seasoning
        // TODO(sjmiles): doh
        //arc.meta = {...arc.meta, ...plan.meta};
        log('===| recipe evacipated: ', recipe.$meta);
        //log.groupEnd();
    }
    static executeAll(recipes, runtime, arc) {
        return Promise.all(recipes?.map(recipe => this.execute(recipe, runtime, arc)));
    }
    static evacipateAll(recipes, runtime, arc) {
        return Promise.all(recipes?.map(recipe => this.evacipate(recipe, runtime, arc)));
    }
}


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Parser": () => (/* binding */ Parser)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.recipe, 'flan', 'violet');
const { entries, create } = Object;
class Parser {
    stores;
    particles;
    slots;
    meta;
    constructor(recipe) {
        this.stores = [];
        this.particles = [];
        this.slots = [];
        this.meta = create(null);
        if (recipe) {
            this.parse(recipe);
        }
    }
    parse(recipe) {
        // `normalize` converts shorthand to longhand before parsing
        const normalized = this.normalize(recipe);
        this.parseSlotSpec(normalized, 'root', '');
        //log(this);
        return this;
    }
    normalize(recipe) {
        if (typeof recipe !== 'object') {
            throw Error('recipe must be an Object');
        }
        // TODO(sjmiles): would be great if `normalize` normalized all the things
        return recipe;
    }
    parseSlotSpec(spec, slotName, parentName) {
        // process entries
        for (const key in spec) {
            const info = spec[key];
            switch (key) {
                case '$meta':
                    // value is a dictionary
                    this.meta = { ...this.meta, ...info };
                    break;
                case '$stores':
                    // value is a StoreSpec
                    this.parseStoresNode(info);
                    break;
                default: {
                    // value is a ParticleSpec
                    const container = parentName ? `${parentName}#${slotName}` : slotName;
                    this.parseParticleSpec(container, key, info);
                    break;
                }
            }
        }
    }
    parseStoresNode(stores) {
        for (const key in stores) {
            this.parseStoreSpec(key, stores[key]);
        }
    }
    parseStoreSpec(name, spec) {
        if (this.stores.find(s => s.name === name)) {
            log('duplicate store name');
            return;
        }
        const meta = {
            name,
            type: spec.$type,
            tags: spec.$tags,
            value: spec.$value
        };
        this.stores.push(meta);
    }
    parseParticleSpec(container, id, spec) {
        if (!spec.$kind) {
            log.warn(`parseParticleSpec: malformed spec has no "kind":`, spec);
            throw Error();
        }
        if (this.particles.find(s => s.id === id)) {
            log('duplicate particle name');
            return;
        }
        //log('pushing ', id);
        this.particles.push({ id, container, spec });
        if (spec.$slots) {
            this.parseSlotsNode(spec.$slots, id);
        }
    }
    parseSlotsNode(slots, parent) {
        entries(slots).forEach(([key, spec]) => this.parseSlotSpec(spec, key, parent));
    }
}


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StoreCook": () => (/* binding */ StoreCook)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _utils_matching_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.recipe, 'StoreCook', '#187e13');
const { values } = Object;
const findStores = (runtime, criteria) => {
    return values(runtime.stores).filter(store => (0,_utils_matching_js__WEBPACK_IMPORTED_MODULE_1__.matches)(store.meta, criteria));
};
const mapStore = (runtime, { name, type }) => {
    return findStores(runtime, { name, type })?.[0];
};
class StoreCook {
    static async execute(runtime, arc, plan) {
        return StoreCook.forEachStore(runtime, arc, plan, StoreCook.realizeStore);
    }
    static async evacipate(runtime, arc, plan) {
        return StoreCook.forEachStore(runtime, arc, plan, StoreCook.derealizeStore);
    }
    static async forEachStore(runtime, arc, plan, func) {
        return Promise.all(plan.stores.map(store => func(runtime, arc, store)));
    }
    static async realizeStore(runtime, arc, spec) {
        const meta = StoreCook.constructMeta(runtime, arc, spec);
        let store = mapStore(runtime, meta);
        if (!store) {
            //log.error('realizeStore: mapStore returned null');
        }
        else {
            log(`realizeStore: mapped "${spec.name}" to "${store.meta.name}"`);
        }
        if (!store) {
            store = runtime.createStore(meta);
            // TODO(sjmiles): Stores no longer know their own id, so there is a wrinkle here as we
            // re-route persistence through runtime (so we can bind in the id)
            // Also: the 'id' is known as 'meta.name' here, this is also a problem
            store.persistor = {
                restore: store => runtime.persistor?.restore(meta.name, store),
                persist: () => { }
            };
            runtime.addStore(meta.name, store);
            await store.restore(meta?.value);
            log(`realizeStore: created "${meta.name}"`);
        }
        else {
            log(`realizeStore: mapped to "${meta.name}", setting data to:`, meta?.value);
            store.data = meta?.value;
        }
        arc.addStore(meta.name, store);
    }
    static async derealizeStore(runtime, arc, spec) {
        runtime.removeStore(spec.name);
        arc.removeStore(spec.name);
    }
    static constructMeta(runtime, arc, spec) {
        const meta = {
            ...spec,
            arcid: arc.id,
            uid: runtime.uid,
        };
        return {
            ...meta,
            owner: meta.uid,
            shareid: `${meta.name}:${meta.arcid}:${meta.uid}`
        };
    }
}


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "matches": () => (/* binding */ matches)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
function matches(candidateMeta, targetMeta) {
    for (const property in targetMeta) {
        if (candidateMeta[property] !== targetMeta[property]) {
            return false;
        }
    }
    return true;
}
;


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParticleCook": () => (/* binding */ ParticleCook)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.recipe, 'ParticleCook', '#096f33');
class ParticleCook {
    static async execute(runtime, arc, plan) {
        // serial
        for (const particle of plan.particles) {
            await this.realizeParticle(runtime, arc, particle);
        }
        // parallel
        //return Promise.all(plan.particles.map(particle => this.realizeParticle(runtime, arc, particle)));
    }
    static async realizeParticle(runtime, arc, node) {
        // convert spec to metadata
        const meta = this.specToMeta(node.spec);
        meta.container ||= node.container;
        // make a (hosted) particle
        return runtime.bootstrapParticle(arc, node.id, meta);
    }
    static specToMeta(spec) {
        // TODO(sjmiles): impedance mismatch here is likely to cause problems
        const { $kind: kind, $container: container, $staticInputs: staticInputs, $bindings: bindings } = spec;
        const inputs = this.formatBindings(spec.$inputs);
        const outputs = this.formatBindings(spec.$outputs);
        return { kind, staticInputs, bindings, inputs, outputs, container };
    }
    static formatBindings(bindings) {
        return bindings?.map(binding => typeof binding === 'string' ? { [binding]: '' } : binding);
    }
    static async evacipate(runtime, arc, plan) {
        return Promise.all(plan.particles.map(particle => this.derealizeParticle(runtime, arc, particle)));
    }
    static async derealizeParticle(runtime, arc, node) {
        arc.removeHost(node.id);
    }
}


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Composer": () => (/* binding */ Composer)
/* harmony export */ });
/* harmony import */ var _core_EventEmitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory.flags.composer, 'composer', 'red');
class Composer extends _core_EventEmitter_js__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    slots;
    pendingPackets;
    constructor() {
        super();
        this.slots = {};
        this.pendingPackets = [];
    }
    activate() {
        this.fire('activate');
    }
    processPendingPackets() {
        const packets = this.pendingPackets;
        if (packets.length) {
            this.pendingPackets = [];
            packets.forEach(packet => {
                packet.pendCount = (packet.pendCount || 0) + 1;
                this.render(packet);
            });
        }
    }
    render(packet) {
        const { id, container, content: { template, model } } = packet;
        log({ id, container, model });
        let slot = this.slots[id];
        //
        if (model?.$clear) {
            if (slot) {
                this.processPendingPackets();
                this.slots[id] = null;
                this.clearSlot(slot);
            }
            return;
        }
        //
        if (!slot) {
            const parent = this.findContainer(container);
            //log.warn(`found parent, needs slot, container = `, container, parent);
            if (!parent) {
                this.pendingPackets.push(packet);
                if (packet['pendCount'] % 100 === 0) {
                    log.warn(`container [${container}] unavailable for slot [${id}] (x100)`);
                    // stubs out the slot
                    //this.slots[id] = 42;
                }
                return;
            }
            slot = this.generateSlot(id, template, parent);
            this.slots[id] = slot;
        }
        // // skip stubs
        //if (slot === 42) {
        //  return;
        //}
        //
        if (slot && model) {
            slot.set(model);
            this.processPendingPackets();
        }
    }
    clearSlot(slot) {
    }
    findContainer(container) {
        return null;
    }
    generateSlot(id, template, parent) {
        return null;
    }
    onevent(pid, eventlet) {
        log(`[${pid}] sent [${eventlet.handler}] event`);
    }
    requestFontFamily(fontFamily) {
        return false;
    }
}


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Surface": () => (/* binding */ Surface)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _Composer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_0__.logFactory.flags.composer, 'surface', 'tomato');
class Surface {
    // activeComposer: Composer;
    // activate() {
    // }
    // deactivate() {
    // }
    async createComposer(id) {
        const composer = await this.createComposerInstance(id);
        // composer.listen('activate', () => this.composerActivated(composer));
        return composer;
    }
    async createComposerInstance(id) {
        return new _Composer_js__WEBPACK_IMPORTED_MODULE_1__.Composer();
    }
    async service(msg) {
    }
}


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fetchParticleCode": () => (/* binding */ fetchParticleCode),
/* harmony export */   "maybeFetchParticleCode": () => (/* binding */ maybeFetchParticleCode),
/* harmony export */   "pathForKind": () => (/* binding */ pathForKind),
/* harmony export */   "requireParticleBaseCode": () => (/* binding */ requireParticleBaseCode),
/* harmony export */   "requireParticleImplCode": () => (/* binding */ requireParticleImplCode)
/* harmony export */ });
/* harmony import */ var _utils_paths_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory.flags.code, 'code', 'gold');
const defaultParticleBasePath = '$arcs/js/core/Particle.js';
const requireParticleBaseCode = async (sourcePath) => {
    if (!requireParticleBaseCode.source) {
        const path = _utils_paths_js__WEBPACK_IMPORTED_MODULE_0__.Paths.resolve(sourcePath || defaultParticleBasePath);
        log('particle base code path: ', path);
        const response = await fetch(path);
        const moduleText = await response.text() + "\n//# sourceURL=" + path + "\n";
        requireParticleBaseCode.source = moduleText.replace(/export /g, '');
    }
    return requireParticleBaseCode.source;
};
requireParticleBaseCode.source = null;
const requireParticleImplCode = async (kind, options) => {
    const code = options?.code || await fetchParticleCode(kind);
    // TODO(sjmiles): brittle content processing, needs to be documented
    return code.slice(code.indexOf('({'));
};
const fetchParticleCode = async (kind) => {
    if (kind) {
        return await maybeFetchParticleCode(kind);
    }
    log.error(`fetchParticleCode: empty 'kind'`);
};
const maybeFetchParticleCode = async (kind) => {
    const path = pathForKind(_utils_paths_js__WEBPACK_IMPORTED_MODULE_0__.Paths.resolve(kind));
    try {
        const response = await fetch(path);
        //if (response.ok) {
        return await response.text();
        //}
    }
    catch (x) {
        log.error(`could not locate implementation for particle "${kind}" [${path}]`);
    }
};
const pathForKind = (kind) => {
    if (kind) {
        if (!'$./'.includes(kind[0]) && !kind.includes('://')) {
            kind = `$library/${kind}`;
        }
        if (!kind?.split('/').pop().includes('.')) {
            kind = `${kind}.js`;
        }
        return _utils_paths_js__WEBPACK_IMPORTED_MODULE_0__.Paths.resolve(kind);
    }
    return '404';
};


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PathMapper": () => (/* binding */ PathMapper),
/* harmony export */   "Paths": () => (/* binding */ Paths)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const PathMapper = class {
    map;
    constructor(root) {
        this.map = {};
        this.setRoot(root);
    }
    add(mappings) {
        Object.assign(this.map, mappings || {});
    }
    resolve(path) {
        const bits = path.split('/');
        const top = bits.shift();
        const prefix = this.map[top] || top;
        return [prefix, ...bits].join('/');
    }
    setRoot(root) {
        if (root.length && root[root.length - 1] === '/') {
            root = root.slice(0, -1);
        }
        this.add({
            '$root': root,
            '$arcs': root
        });
    }
};
const root = "file:///Users/cromwellian/current/arcsjs-chromium/pkg/demo/vs/arcsjs/src/web/js/utils/paths.js".split('/').slice(0, -3).join('/');
const Paths = globalThis['Paths'] = new PathMapper(root);
Paths.add(globalThis.config?.paths);


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createSesParticleFactory": () => (/* binding */ createSesParticleFactory),
/* harmony export */   "initSes": () => (/* binding */ initSes)
/* harmony export */ });
/* harmony import */ var _utils_paths_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _Runtime_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _code_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(21);
/* harmony import */ var _third_party_ses_ses_umd_min_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(24);
/* harmony import */ var _third_party_ses_ses_umd_min_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_third_party_ses_ses_umd_min_js__WEBPACK_IMPORTED_MODULE_4__);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */





const requiredLog = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory)(true, 'SES', 'goldenrod');
const log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory.flags.ses, 'SES', 'goldenrod');
const { lockdown, Compartment } = globalThis;
let particleCompartment;
const initSes = (options) => {
    if (!particleCompartment) {
        const debugOptions = { consoleTaming: 'unsafe', errorTaming: 'unsafe', errorTrapping: 'report', stackFiltering: 'verbose' };
        const prodOptions = {};
        requiredLog.log('LOCKDOWN');
        requiredLog.groupCollapsed('...removing intrinics...');
        lockdown(debugOptions || prodOptions);
        requiredLog.groupEnd();
        particleCompartment = new Compartment({ log, resolve, html, makeKey, timeout, ...options?.injections, harden: globalThis.harden });
    }
};
const resolve = _utils_paths_js__WEBPACK_IMPORTED_MODULE_0__.Paths.resolve.bind(_utils_paths_js__WEBPACK_IMPORTED_MODULE_0__.Paths);
const html = (strings, ...values) => `${strings[0]}${values.map((v, i) => `${v}${strings[i + 1]}`).join('')}`.trim();
const makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
const timeout = async (func, delayMs) => new Promise(resolve => setTimeout(() => resolve(func()), delayMs));
const createSesParticleFactory = async (kind, options) => {
    // ensure our Particle runner exists in the isolation chamber
    const Particle = await requireParticle();
    // evaluate custom code in isolation chamber
    const implFactory = await requireImplFactory(kind, options);
    // injections
    const log = createLogger(kind);
    const injections = { log, resolve, html, ...options?.injections };
    // construct 3P prototype
    const proto = implFactory(injections);
    // construct particleFactory
    const particleFactory = (host) => {
        const pipe = {
            log,
            output: host.output.bind(host),
            service: host.service.bind(host)
        };
        return new Particle(proto, pipe);
    };
    return particleFactory;
};
const requireImplFactory = async (kind, options) => {
    // snatch up the custom particle code
    const implCode = await (0,_code_js__WEBPACK_IMPORTED_MODULE_3__.requireParticleImplCode)(kind, options);
    let factory;
    try {
        // evaluate in compartment
        factory = particleCompartment.evaluate(implCode);
    }
    catch (x) {
        log.error('failed to evaluate:', implCode);
        throw x;
    }
    // if it's an object
    if (typeof factory === 'object') {
        // repackage the code to eliminate closures
        factory = repackageImplFactory(factory, kind);
        log('repackaged factory:\n', factory);
    }
    return globalThis.harden(factory);
};
const repackageImplFactory = (factory, kind) => {
    const { constNames, rewriteConsts, funcNames, rewriteFuncs } = collectDecls(factory);
    const proto = `{${[...constNames, ...funcNames]}}`;
    const moduleRewrite = `
({log, ...utils}) => {
// protect utils
harden(utils);
// these are just handy
const {assign, keys, entries, values, create} = Object;
// declarations
${[...rewriteConsts, ...rewriteFuncs].join('\n\n')}
// hardened Object (map) of declarations,
// suitable to be a prototype
return harden(${proto});
// name the file for debuggers
//# sourceURL=${(0,_code_js__WEBPACK_IMPORTED_MODULE_3__.pathForKind)(kind).split('/').pop()}-(Sandboxed)
};
  `;
    log('rewritten:\n\n', moduleRewrite);
    return particleCompartment.evaluate(moduleRewrite);
};
const collectDecls = factory => {
    // dictionary to 2-tuples
    const props = Object.entries(factory);
    // filter by typeof
    const isFunc = ([n, p]) => typeof p === 'function';
    // get props that are functions
    const funcs = props.filter(isFunc);
    // rewrite object declarations as module declarations
    const rewriteFuncs = funcs.map(([n, f]) => {
        const code = f.toString();
        const async = code.includes('async');
        const body = code.replace('async ', '').replace('function ', '');
        return `${async ? 'async' : ''} function ${body};`;
    });
    // array up the function names
    const funcNames = funcs.map(([n]) => n);
    // if it's not a Function, it's a const
    const consts = props.filter(item => !isFunc(item));
    // build const decls
    const rewriteConsts = consts.map(([n, p]) => {
        return `const ${n} = \`${p}\`;`;
    });
    // array up the const names
    const constNames = consts.map(([n]) => n);
    return {
        constNames,
        rewriteConsts,
        funcNames,
        rewriteFuncs
    };
};
let privateCtor;
const requireParticle = async () => {
    if (!privateCtor) {
        const baseCode = await (0,_code_js__WEBPACK_IMPORTED_MODULE_3__.requireParticleBaseCode)();
        privateCtor = particleCompartment.evaluate(baseCode);
    }
    return privateCtor;
};
const createLogger = kind => {
    const _log = (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory)(_utils_log_js__WEBPACK_IMPORTED_MODULE_1__.logFactory.flags.particles, kind, 'crimson');
    return (msg, ...args) => {
        const stack = msg?.stack?.split('\n')?.slice(1, 2) || (new Error()).stack.split('\n').slice(2, 3);
        const where = stack
            .map(entry => entry
            .replace(/\([^()]*?\)/, '')
            .replace(/ \([^()]*?\)/, '')
            .replace('<anonymous>, <anonymous>', '')
            .replace('Object.', '')
            .replace('eval at :', '')
            .replace(/\(|\)/g, '')
            .replace(/\[[^\]]*?\] /, '')
            .replace(/at (.*) (\d)/, 'at "$1" $2'))
            .reverse()
            .join('\n')
            .trim();
        if (msg?.message) {
            _log.error(msg.message, ...args, `(${where})`);
        }
        else {
            _log(msg, ...args, `(${where})`);
        }
    };
};
// give the runtime a safe way to instantiate Particles
_Runtime_js__WEBPACK_IMPORTED_MODULE_2__.Runtime.particleIndustry = createSesParticleFactory;
_Runtime_js__WEBPACK_IMPORTED_MODULE_2__.Runtime.securityLockdown = initSes;


/***/ }),
/* 24 */
/***/ (() => {

(functors=>{function cell(name,value){const observers=[];return{get:function(){return value},set:function(newValue){value=newValue;for(const observe of observers)observe(value)},observe:function(observe){observers.push(observe),observe(value)},enumerable:!0}}const cells=[{globalThis:cell(),Array:cell(),Date:cell(),Float32Array:cell(),JSON:cell(),Map:cell(),Math:cell(),Object:cell(),Promise:cell(),Proxy:cell(),Reflect:cell(),RegExp:cell(),Set:cell(),String:cell(),WeakMap:cell(),WeakSet:cell(),Error:cell(),RangeError:cell(),ReferenceError:cell(),SyntaxError:cell(),TypeError:cell(),assign:cell(),create:cell(),defineProperties:cell(),entries:cell(),freeze:cell(),getOwnPropertyDescriptor:cell(),getOwnPropertyDescriptors:cell(),getOwnPropertyNames:cell(),getPrototypeOf:cell(),is:cell(),isExtensible:cell(),keys:cell(),objectPrototype:cell(),seal:cell(),setPrototypeOf:cell(),values:cell(),speciesSymbol:cell(),toStringTagSymbol:cell(),iteratorSymbol:cell(),matchAllSymbol:cell(),stringifyJson:cell(),fromEntries:cell(),defineProperty:cell(),apply:cell(),construct:cell(),reflectGet:cell(),reflectGetOwnPropertyDescriptor:cell(),reflectHas:cell(),reflectIsExtensible:cell(),ownKeys:cell(),reflectPreventExtensions:cell(),reflectSet:cell(),isArray:cell(),arrayPrototype:cell(),mapPrototype:cell(),proxyRevocable:cell(),regexpPrototype:cell(),setPrototype:cell(),stringPrototype:cell(),weakmapPrototype:cell(),weaksetPrototype:cell(),functionPrototype:cell(),uncurryThis:cell(),objectHasOwnProperty:cell(),arrayForEach:cell(),arrayFilter:cell(),arrayJoin:cell(),arrayPush:cell(),arrayPop:cell(),arrayIncludes:cell(),mapSet:cell(),mapGet:cell(),mapHas:cell(),setAdd:cell(),setForEach:cell(),setHas:cell(),regexpTest:cell(),stringEndsWith:cell(),stringIncludes:cell(),stringMatch:cell(),stringSearch:cell(),stringSlice:cell(),stringSplit:cell(),stringStartsWith:cell(),weakmapGet:cell(),weakmapSet:cell(),weakmapHas:cell(),weaksetAdd:cell(),weaksetSet:cell(),weaksetHas:cell(),functionToString:cell(),getConstructorOf:cell(),immutableObject:cell(),isObject:cell(),FERAL_EVAL:cell(),FERAL_FUNCTION:cell()},{},{an:cell(),bestEffortStringify:cell()},{},{unredactedDetails:cell(),loggedErrorHandler:cell(),makeAssert:cell(),assert:cell()},{makeEvaluateFactory:cell()},{isValidIdentifierName:cell(),getScopeConstants:cell()},{createScopeHandler:cell()},{getSourceURL:cell()},{rejectHtmlComments:cell(),evadeHtmlCommentTest:cell(),rejectImportExpressions:cell(),evadeImportExpressionTest:cell(),rejectSomeDirectEvalExpressions:cell(),mandatoryTransforms:cell(),applyTransforms:cell()},{performEval:cell()},{makeEvalFunction:cell()},{makeFunctionConstructor:cell()},{constantProperties:cell(),universalPropertyNames:cell(),initialGlobalPropertyNames:cell(),sharedGlobalPropertyNames:cell(),uniqueGlobalPropertyNames:cell(),NativeErrors:cell(),FunctionInstance:cell(),isAccessorPermit:cell(),whitelist:cell()},{initGlobalObject:cell()},{makeAlias:cell(),load:cell()},{deferExports:cell(),getDeferredExports:cell()},{makeThirdPartyModuleInstance:cell(),makeModuleInstance:cell()},{link:cell(),instantiate:cell()},{InertCompartment:cell(),CompartmentPrototype:cell(),makeCompartmentConstructor:cell()},{getAnonymousIntrinsics:cell()},{makeIntrinsicsCollector:cell(),getGlobalIntrinsics:cell()},{minEnablements:cell(),moderateEnablements:cell(),severeEnablements:cell()},{default:cell()},{makeLoggingConsoleKit:cell(),makeCausalConsole:cell(),filterConsole:cell(),consoleWhitelist:cell(),BASE_CONSOLE_LEVEL:cell()},{tameConsole:cell()},{filterFileName:cell(),shortenCallSiteString:cell(),tameV8ErrorConstructor:cell()},{default:cell()},{makeHardener:cell()},{default:cell()},{default:cell()},{tameFunctionToString:cell()},{default:cell()},{default:cell()},{default:cell()},{default:cell()},{repairIntrinsics:cell(),makeLockdown:cell()},{}],namespaces=cells.map(cells=>Object.create(null,cells));for(let index=0;index<namespaces.length;index+=1)cells[index]["*"]=cell(0,namespaces[index]);functors[0]({imports(entries){new Map(entries)},liveVar:{},onceVar:{universalThis:cells[0].globalThis.set,Array:cells[0].Array.set,Date:cells[0].Date.set,Float32Array:cells[0].Float32Array.set,JSON:cells[0].JSON.set,Map:cells[0].Map.set,Math:cells[0].Math.set,Object:cells[0].Object.set,Promise:cells[0].Promise.set,Proxy:cells[0].Proxy.set,Reflect:cells[0].Reflect.set,RegExp:cells[0].RegExp.set,Set:cells[0].Set.set,String:cells[0].String.set,WeakMap:cells[0].WeakMap.set,WeakSet:cells[0].WeakSet.set,Error:cells[0].Error.set,RangeError:cells[0].RangeError.set,ReferenceError:cells[0].ReferenceError.set,SyntaxError:cells[0].SyntaxError.set,TypeError:cells[0].TypeError.set,assign:cells[0].assign.set,create:cells[0].create.set,defineProperties:cells[0].defineProperties.set,entries:cells[0].entries.set,freeze:cells[0].freeze.set,getOwnPropertyDescriptor:cells[0].getOwnPropertyDescriptor.set,getOwnPropertyDescriptors:cells[0].getOwnPropertyDescriptors.set,getOwnPropertyNames:cells[0].getOwnPropertyNames.set,getPrototypeOf:cells[0].getPrototypeOf.set,is:cells[0].is.set,isExtensible:cells[0].isExtensible.set,keys:cells[0].keys.set,objectPrototype:cells[0].objectPrototype.set,seal:cells[0].seal.set,setPrototypeOf:cells[0].setPrototypeOf.set,values:cells[0].values.set,speciesSymbol:cells[0].speciesSymbol.set,toStringTagSymbol:cells[0].toStringTagSymbol.set,iteratorSymbol:cells[0].iteratorSymbol.set,matchAllSymbol:cells[0].matchAllSymbol.set,stringifyJson:cells[0].stringifyJson.set,fromEntries:cells[0].fromEntries.set,defineProperty:cells[0].defineProperty.set,apply:cells[0].apply.set,construct:cells[0].construct.set,reflectGet:cells[0].reflectGet.set,reflectGetOwnPropertyDescriptor:cells[0].reflectGetOwnPropertyDescriptor.set,reflectHas:cells[0].reflectHas.set,reflectIsExtensible:cells[0].reflectIsExtensible.set,ownKeys:cells[0].ownKeys.set,reflectPreventExtensions:cells[0].reflectPreventExtensions.set,reflectSet:cells[0].reflectSet.set,isArray:cells[0].isArray.set,arrayPrototype:cells[0].arrayPrototype.set,mapPrototype:cells[0].mapPrototype.set,proxyRevocable:cells[0].proxyRevocable.set,regexpPrototype:cells[0].regexpPrototype.set,setPrototype:cells[0].setPrototype.set,stringPrototype:cells[0].stringPrototype.set,weakmapPrototype:cells[0].weakmapPrototype.set,weaksetPrototype:cells[0].weaksetPrototype.set,functionPrototype:cells[0].functionPrototype.set,uncurryThis:cells[0].uncurryThis.set,objectHasOwnProperty:cells[0].objectHasOwnProperty.set,arrayForEach:cells[0].arrayForEach.set,arrayFilter:cells[0].arrayFilter.set,arrayJoin:cells[0].arrayJoin.set,arrayPush:cells[0].arrayPush.set,arrayPop:cells[0].arrayPop.set,arrayIncludes:cells[0].arrayIncludes.set,mapSet:cells[0].mapSet.set,mapGet:cells[0].mapGet.set,mapHas:cells[0].mapHas.set,setAdd:cells[0].setAdd.set,setForEach:cells[0].setForEach.set,setHas:cells[0].setHas.set,regexpTest:cells[0].regexpTest.set,stringEndsWith:cells[0].stringEndsWith.set,stringIncludes:cells[0].stringIncludes.set,stringMatch:cells[0].stringMatch.set,stringSearch:cells[0].stringSearch.set,stringSlice:cells[0].stringSlice.set,stringSplit:cells[0].stringSplit.set,stringStartsWith:cells[0].stringStartsWith.set,weakmapGet:cells[0].weakmapGet.set,weakmapSet:cells[0].weakmapSet.set,weakmapHas:cells[0].weakmapHas.set,weaksetAdd:cells[0].weaksetAdd.set,weaksetSet:cells[0].weaksetSet.set,weaksetHas:cells[0].weaksetHas.set,functionToString:cells[0].functionToString.set,getConstructorOf:cells[0].getConstructorOf.set,immutableObject:cells[0].immutableObject.set,isObject:cells[0].isObject.set,FERAL_EVAL:cells[0].FERAL_EVAL.set,FERAL_FUNCTION:cells[0].FERAL_FUNCTION.set}}),functors[1]({imports(entries){new Map(entries)},liveVar:{},onceVar:{}}),functors[2]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("../commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{an:cells[2].an.set,bestEffortStringify:cells[2].bestEffortStringify.set}}),functors[3]({imports(entries){new Map(entries)},liveVar:{},onceVar:{}}),functors[4]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("../commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./internal-types.js")){const cell=cells[1][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./stringify-utils.js")){const cell=cells[2][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./types.js")){const cell=cells[3][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{unredactedDetails:cells[4].unredactedDetails.set,loggedErrorHandler:cells[4].loggedErrorHandler.set,makeAssert:cells[4].makeAssert.set,assert:cells[4].assert.set}}),functors[5]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeEvaluateFactory:cells[5].makeEvaluateFactory.set}}),functors[6]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{isValidIdentifierName:cells[6].isValidIdentifierName.set,getScopeConstants:cells[6].getScopeConstants.set}}),functors[7]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{createScopeHandler:cells[7].createScopeHandler.set}}),functors[8]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{getSourceURL:cells[8].getSourceURL.set}}),functors[9]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./get-source-url.js")){const cell=cells[8][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{rejectHtmlComments:cells[9].rejectHtmlComments.set,evadeHtmlCommentTest:cells[9].evadeHtmlCommentTest.set,rejectImportExpressions:cells[9].rejectImportExpressions.set,evadeImportExpressionTest:cells[9].evadeImportExpressionTest.set,rejectSomeDirectEvalExpressions:cells[9].rejectSomeDirectEvalExpressions.set,mandatoryTransforms:cells[9].mandatoryTransforms.set,applyTransforms:cells[9].applyTransforms.set}}),functors[10]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./make-evaluate-factory.js")){const cell=cells[5][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./scope-constants.js")){const cell=cells[6][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./scope-handler.js")){const cell=cells[7][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./transforms.js")){const cell=cells[9][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{performEval:cells[10].performEval.set}}),functors[11]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./evaluate.js")){const cell=cells[10][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeEvalFunction:cells[11].makeEvalFunction.set}}),functors[12]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./evaluate.js")){const cell=cells[10][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeFunctionConstructor:cells[12].makeFunctionConstructor.set}}),functors[13]({imports(entries){new Map(entries)},liveVar:{},onceVar:{constantProperties:cells[13].constantProperties.set,universalPropertyNames:cells[13].universalPropertyNames.set,initialGlobalPropertyNames:cells[13].initialGlobalPropertyNames.set,sharedGlobalPropertyNames:cells[13].sharedGlobalPropertyNames.set,uniqueGlobalPropertyNames:cells[13].uniqueGlobalPropertyNames.set,NativeErrors:cells[13].NativeErrors.set,FunctionInstance:cells[13].FunctionInstance.set,isAccessorPermit:cells[13].isAccessorPermit.set,whitelist:cells[13].whitelist.set}}),functors[14]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./make-eval-function.js")){const cell=cells[11][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./make-function-constructor.js")){const cell=cells[12][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./whitelist.js")){const cell=cells[13][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{initGlobalObject:cells[14].initGlobalObject.set}}),functors[15]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeAlias:cells[15].makeAlias.set,load:cells[15].load.set}}),functors[16]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./module-load.js")){const cell=cells[15][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{deferExports:cells[16].deferExports.set,getDeferredExports:cells[16].getDeferredExports.set}}),functors[17]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./module-proxy.js")){const cell=cells[16][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeThirdPartyModuleInstance:cells[17].makeThirdPartyModuleInstance.set,makeModuleInstance:cells[17].makeModuleInstance.set}}),functors[18]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./module-instance.js")){const cell=cells[17][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{link:cells[18].link.set,instantiate:cells[18].instantiate.set}}),functors[19]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./evaluate.js")){const cell=cells[10][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./global-object.js")){const cell=cells[14][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./module-link.js")){const cell=cells[18][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./module-load.js")){const cell=cells[15][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./module-proxy.js")){const cell=cells[16][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./scope-constants.js")){const cell=cells[6][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./transforms.js")){const cell=cells[9][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./whitelist.js")){const cell=cells[13][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{InertCompartment:cells[19].InertCompartment.set,CompartmentPrototype:cells[19].CompartmentPrototype.set,makeCompartmentConstructor:cells[19].makeCompartmentConstructor.set}}),functors[20]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./compartment-shim.js")){const cell=cells[19][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{getAnonymousIntrinsics:cells[20].getAnonymousIntrinsics.set}}),functors[21]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./whitelist.js")){const cell=cells[13][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeIntrinsicsCollector:cells[21].makeIntrinsicsCollector.set,getGlobalIntrinsics:cells[21].getGlobalIntrinsics.set}}),functors[22]({imports(entries){new Map(entries)},liveVar:{},onceVar:{minEnablements:cells[22].minEnablements.set,moderateEnablements:cells[22].moderateEnablements.set,severeEnablements:cells[22].severeEnablements.set}}),functors[23]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./enablements.js")){const cell=cells[22][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[23].default.set}}),functors[24]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("../commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./internal-types.js")){const cell=cells[1][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./types.js")){const cell=cells[3][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeLoggingConsoleKit:cells[24].makeLoggingConsoleKit.set,makeCausalConsole:cells[24].makeCausalConsole.set,filterConsole:cells[24].filterConsole.set,consoleWhitelist:cells[24].consoleWhitelist.set,BASE_CONSOLE_LEVEL:cells[24].BASE_CONSOLE_LEVEL.set}}),functors[25]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("../commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./console.js")){const cell=cells[24][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./internal-types.js")){const cell=cells[1][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./types.js")){const cell=cells[3][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{tameConsole:cells[25].tameConsole.set}}),functors[26]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("../commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{filterFileName:cells[26].filterFileName.set,shortenCallSiteString:cells[26].shortenCallSiteString.set,tameV8ErrorConstructor:cells[26].tameV8ErrorConstructor.set}}),functors[27]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("../commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("../whitelist.js")){const cell=cells[13][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-v8-error-constructor.js")){const cell=cells[26][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[27].default.set}}),functors[28]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{makeHardener:cells[28].makeHardener.set}}),functors[29]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[29].default.set}}),functors[30]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[30].default.set}}),functors[31]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{tameFunctionToString:cells[31].tameFunctionToString.set}}),functors[32]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[32].default.set}}),functors[33]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[33].default.set}}),functors[34]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[34].default.set}}),functors[35]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./whitelist.js")){const cell=cells[13][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{default:cells[35].default.set}}),functors[36]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./enable-property-overrides.js")){const cell=cells[23][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/tame-console.js")){const cell=cells[25][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./error/tame-error-constructor.js")){const cell=cells[27][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./global-object.js")){const cell=cells[14][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./intrinsics.js")){const cell=cells[21][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./make-hardener.js")){const cell=cells[28][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-date-constructor.js")){const cell=cells[29][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-function-constructors.js")){const cell=cells[30][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-function-tostring.js")){const cell=cells[31][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-locale-methods.js")){const cell=cells[32][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-math-object.js")){const cell=cells[33][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./tame-regexp-constructor.js")){const cell=cells[34][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./whitelist-intrinsics.js")){const cell=cells[35][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./whitelist.js")){const cell=cells[13][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{repairIntrinsics:cells[36].repairIntrinsics.set,makeLockdown:cells[36].makeLockdown.set}}),functors[37]({imports(entries){const map=new Map(entries);for(const[name,observers]of map.get("./src/commons.js")){const cell=cells[0][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./src/compartment-shim.js")){const cell=cells[19][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./src/error/assert.js")){const cell=cells[4][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./src/get-anonymous-intrinsics.js")){const cell=cells[20][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./src/intrinsics.js")){const cell=cells[21][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./src/lockdown-shim.js")){const cell=cells[36][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}for(const[name,observers]of map.get("./src/tame-function-tostring.js")){const cell=cells[31][name];if(void 0===cell)throw new ReferenceError("Cannot import name "+name);for(const observer of observers)cell.observe(observer)}},liveVar:{},onceVar:{}})})([({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{$h‍_imports([]);const universalThis=globalThis;$h‍_once.universalThis(universalThis);const{Array:Array,Date:Date,Float32Array:Float32Array,JSON:JSON,Map:Map,Math:Math,Object:Object,Promise:Promise,Proxy:Proxy,Reflect:Reflect,RegExp:RegExp,Set:Set,String:String,WeakMap:WeakMap,WeakSet:WeakSet}=globalThis;$h‍_once.Array(Array),$h‍_once.Date(Date),$h‍_once.Float32Array(Float32Array),$h‍_once.JSON(JSON),$h‍_once.Map(Map),$h‍_once.Math(Math),$h‍_once.Object(Object),$h‍_once.Promise(Promise),$h‍_once.Proxy(Proxy),$h‍_once.Reflect(Reflect),$h‍_once.RegExp(RegExp),$h‍_once.Set(Set),$h‍_once.String(String),$h‍_once.WeakMap(WeakMap),$h‍_once.WeakSet(WeakSet);const{Error:Error,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError}=globalThis;$h‍_once.Error(Error),$h‍_once.RangeError(RangeError),$h‍_once.ReferenceError(ReferenceError),$h‍_once.SyntaxError(SyntaxError),$h‍_once.TypeError(TypeError);const{assign:assign,create:create,defineProperties:defineProperties,entries:entries,freeze:freeze,getOwnPropertyDescriptor:getOwnPropertyDescriptor,getOwnPropertyDescriptors:getOwnPropertyDescriptors,getOwnPropertyNames:getOwnPropertyNames,getPrototypeOf:getPrototypeOf,is:is,isExtensible:isExtensible,keys:keys,prototype:objectPrototype,seal:seal,setPrototypeOf:setPrototypeOf,values:values}=Object;$h‍_once.assign(assign),$h‍_once.create(create),$h‍_once.defineProperties(defineProperties),$h‍_once.entries(entries),$h‍_once.freeze(freeze),$h‍_once.getOwnPropertyDescriptor(getOwnPropertyDescriptor),$h‍_once.getOwnPropertyDescriptors(getOwnPropertyDescriptors),$h‍_once.getOwnPropertyNames(getOwnPropertyNames),$h‍_once.getPrototypeOf(getPrototypeOf),$h‍_once.is(is),$h‍_once.isExtensible(isExtensible),$h‍_once.keys(keys),$h‍_once.objectPrototype(objectPrototype),$h‍_once.seal(seal),$h‍_once.setPrototypeOf(setPrototypeOf),$h‍_once.values(values);const{species:speciesSymbol,toStringTag:toStringTagSymbol,iterator:iteratorSymbol,matchAll:matchAllSymbol}=Symbol;$h‍_once.speciesSymbol(speciesSymbol),$h‍_once.toStringTagSymbol(toStringTagSymbol),$h‍_once.iteratorSymbol(iteratorSymbol),$h‍_once.matchAllSymbol(matchAllSymbol);const{stringify:stringifyJson}=JSON;$h‍_once.stringifyJson(stringifyJson);const fromEntries=Object.fromEntries||(entryPairs=>{const result={};for(const[prop,val]of entryPairs)result[prop]=val;return result});$h‍_once.fromEntries(fromEntries);const{defineProperty:originalDefineProperty}=Object;$h‍_once.defineProperty((object,prop,descriptor)=>{const result=originalDefineProperty(object,prop,descriptor);if(result!==object)throw TypeError(`Please report that the original defineProperty silently failed to set ${JSON.stringify(String(prop))}. (SES_DEFINE_PROPERTY_FAILED_SILENTLY)`);return result});const{apply:apply,construct:construct,get:reflectGet,getOwnPropertyDescriptor:reflectGetOwnPropertyDescriptor,has:reflectHas,isExtensible:reflectIsExtensible,ownKeys:ownKeys,preventExtensions:reflectPreventExtensions,set:reflectSet}=Reflect;$h‍_once.apply(apply),$h‍_once.construct(construct),$h‍_once.reflectGet(reflectGet),$h‍_once.reflectGetOwnPropertyDescriptor(reflectGetOwnPropertyDescriptor),$h‍_once.reflectHas(reflectHas),$h‍_once.reflectIsExtensible(reflectIsExtensible),$h‍_once.ownKeys(ownKeys),$h‍_once.reflectPreventExtensions(reflectPreventExtensions),$h‍_once.reflectSet(reflectSet);const{isArray:isArray,prototype:arrayPrototype}=Array;$h‍_once.isArray(isArray),$h‍_once.arrayPrototype(arrayPrototype);const{prototype:mapPrototype}=Map;$h‍_once.mapPrototype(mapPrototype);const{revocable:proxyRevocable}=Proxy;$h‍_once.proxyRevocable(proxyRevocable);const{prototype:regexpPrototype}=RegExp;$h‍_once.regexpPrototype(regexpPrototype);const{prototype:setPrototype}=Set;$h‍_once.setPrototype(setPrototype);const{prototype:stringPrototype}=String;$h‍_once.stringPrototype(stringPrototype);const{prototype:weakmapPrototype}=WeakMap;$h‍_once.weakmapPrototype(weakmapPrototype);const{prototype:weaksetPrototype}=WeakSet;$h‍_once.weaksetPrototype(weaksetPrototype);const{prototype:functionPrototype}=Function;$h‍_once.functionPrototype(functionPrototype);const uncurryThis=fn=>(thisArg,...args)=>apply(fn,thisArg,args);$h‍_once.uncurryThis(uncurryThis);const objectHasOwnProperty=uncurryThis(objectPrototype.hasOwnProperty);$h‍_once.objectHasOwnProperty(objectHasOwnProperty);const arrayForEach=uncurryThis(arrayPrototype.forEach);$h‍_once.arrayForEach(arrayForEach);const arrayFilter=uncurryThis(arrayPrototype.filter);$h‍_once.arrayFilter(arrayFilter);const arrayJoin=uncurryThis(arrayPrototype.join);$h‍_once.arrayJoin(arrayJoin);const arrayPush=uncurryThis(arrayPrototype.push);$h‍_once.arrayPush(arrayPush);const arrayPop=uncurryThis(arrayPrototype.pop);$h‍_once.arrayPop(arrayPop);const arrayIncludes=uncurryThis(arrayPrototype.includes);$h‍_once.arrayIncludes(arrayIncludes);const mapSet=uncurryThis(mapPrototype.set);$h‍_once.mapSet(mapSet);const mapGet=uncurryThis(mapPrototype.get);$h‍_once.mapGet(mapGet);const mapHas=uncurryThis(mapPrototype.has);$h‍_once.mapHas(mapHas);const setAdd=uncurryThis(setPrototype.add);$h‍_once.setAdd(setAdd);const setForEach=uncurryThis(setPrototype.forEach);$h‍_once.setForEach(setForEach);const setHas=uncurryThis(setPrototype.has);$h‍_once.setHas(setHas);const regexpTest=uncurryThis(regexpPrototype.test);$h‍_once.regexpTest(regexpTest);const stringEndsWith=uncurryThis(stringPrototype.endsWith);$h‍_once.stringEndsWith(stringEndsWith);const stringIncludes=uncurryThis(stringPrototype.includes);$h‍_once.stringIncludes(stringIncludes);const stringMatch=uncurryThis(stringPrototype.match);$h‍_once.stringMatch(stringMatch);const stringSearch=uncurryThis(stringPrototype.search);$h‍_once.stringSearch(stringSearch);const stringSlice=uncurryThis(stringPrototype.slice);$h‍_once.stringSlice(stringSlice);const stringSplit=uncurryThis(stringPrototype.split);$h‍_once.stringSplit(stringSplit);const stringStartsWith=uncurryThis(stringPrototype.startsWith);$h‍_once.stringStartsWith(stringStartsWith);const weakmapGet=uncurryThis(weakmapPrototype.get);$h‍_once.weakmapGet(weakmapGet);const weakmapSet=uncurryThis(weakmapPrototype.set);$h‍_once.weakmapSet(weakmapSet);const weakmapHas=uncurryThis(weakmapPrototype.has);$h‍_once.weakmapHas(weakmapHas);const weaksetAdd=uncurryThis(weaksetPrototype.add);$h‍_once.weaksetAdd(weaksetAdd);const weaksetSet=uncurryThis(weaksetPrototype.set);$h‍_once.weaksetSet(weaksetSet);const weaksetHas=uncurryThis(weaksetPrototype.has);$h‍_once.weaksetHas(weaksetHas);const functionToString=uncurryThis(functionPrototype.toString);$h‍_once.functionToString(functionToString);$h‍_once.getConstructorOf(fn=>reflectGet(getPrototypeOf(fn),"constructor"));const immutableObject=freeze(create(null));$h‍_once.immutableObject(immutableObject);$h‍_once.isObject(value=>Object(value)===value);const FERAL_EVAL=eval;$h‍_once.FERAL_EVAL(FERAL_EVAL);const FERAL_FUNCTION=Function;$h‍_once.FERAL_FUNCTION(FERAL_FUNCTION)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{$h‍_imports([])},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,Set,String,freeze,is,setAdd,setHas,stringStartsWith,stringIncludes,stringifyJson,toStringTagSymbol;$h‍_imports([["../commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Set",[$h‍_a=>Set=$h‍_a]],["String",[$h‍_a=>String=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["is",[$h‍_a=>is=$h‍_a]],["setAdd",[$h‍_a=>setAdd=$h‍_a]],["setHas",[$h‍_a=>setHas=$h‍_a]],["stringStartsWith",[$h‍_a=>stringStartsWith=$h‍_a]],["stringIncludes",[$h‍_a=>stringIncludes=$h‍_a]],["stringifyJson",[$h‍_a=>stringifyJson=$h‍_a]],["toStringTagSymbol",[$h‍_a=>toStringTagSymbol=$h‍_a]]]]]);const an=str=>(str=""+str).length>=1&&stringIncludes("aeiouAEIOU",str[0])?"an "+str:"a "+str;$h‍_once.an(an),freeze(an);const bestEffortStringify=(payload,spaces)=>{const seenSet=new Set,replacer=(_,val)=>{switch(typeof val){case"object":return null===val?null:setHas(seenSet,val)?"[Seen]":(setAdd(seenSet,val),val instanceof Error?`[${val.name}: ${val.message}]`:toStringTagSymbol in val?`[${val[toStringTagSymbol]}]`:val);case"function":return`[Function ${val.name||"<anon>"}]`;case"string":return stringStartsWith(val,"[")?`[${val}]`:val;case"undefined":case"symbol":return`[${String(val)}]`;case"bigint":return`[${val}n]`;case"number":return is(val,NaN)?"[NaN]":val===1/0?"[Infinity]":val===-1/0?"[-Infinity]":val;default:return val}};try{return stringifyJson(payload,replacer,spaces)}catch(_err){return"[Something that failed to stringify]"}};$h‍_once.bestEffortStringify(bestEffortStringify),freeze(bestEffortStringify)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{$h‍_imports([])},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,RangeError,TypeError,WeakMap,assign,freeze,globalThis,is,weakmapGet,weakmapSet,an,bestEffortStringify;$h‍_imports([["../commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["RangeError",[$h‍_a=>RangeError=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["WeakMap",[$h‍_a=>WeakMap=$h‍_a]],["assign",[$h‍_a=>assign=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["globalThis",[$h‍_a=>globalThis=$h‍_a]],["is",[$h‍_a=>is=$h‍_a]],["weakmapGet",[$h‍_a=>weakmapGet=$h‍_a]],["weakmapSet",[$h‍_a=>weakmapSet=$h‍_a]]]],["./stringify-utils.js",[["an",[$h‍_a=>an=$h‍_a]],["bestEffortStringify",[$h‍_a=>bestEffortStringify=$h‍_a]]]],["./types.js",[]],["./internal-types.js",[]]]);const declassifiers=new WeakMap,quote=(payload,spaces)=>{const result=freeze({toString:freeze(()=>bestEffortStringify(payload,spaces))});return declassifiers.set(result,payload),result};freeze(quote);const hiddenDetailsMap=new WeakMap,getMessageString=({template:template,args:args})=>{const parts=[template[0]];for(let i=0;i<args.length;i+=1){const arg=args[i];let argStr;argStr=declassifiers.has(arg)?""+arg:arg instanceof Error?`(${an(arg.name)})`:`(${an(typeof arg)})`,parts.push(argStr,template[i+1])}return parts.join("")},DetailsTokenProto=freeze({toString(){const hiddenDetails=hiddenDetailsMap.get(this);return void 0===hiddenDetails?"[Not a DetailsToken]":getMessageString(hiddenDetails)}});freeze(DetailsTokenProto.toString);const redactedDetails=(template,...args)=>{const detailsToken=freeze({__proto__:DetailsTokenProto});return hiddenDetailsMap.set(detailsToken,{template:template,args:args}),detailsToken};freeze(redactedDetails);const unredactedDetails=(template,...args)=>(args=args.map(arg=>declassifiers.has(arg)?arg:quote(arg)),redactedDetails(template,...args));$h‍_once.unredactedDetails(unredactedDetails),freeze(unredactedDetails);const getLogArgs=({template:template,args:args})=>{const logArgs=[template[0]];for(let i=0;i<args.length;i+=1){let arg=args[i];declassifiers.has(arg)&&(arg=declassifiers.get(arg));const priorWithoutSpace=(logArgs.pop()||"").replace(/ $/,"");""!==priorWithoutSpace&&logArgs.push(priorWithoutSpace);const nextWithoutSpace=template[i+1].replace(/^ /,"");logArgs.push(arg,nextWithoutSpace)}return""===logArgs[logArgs.length-1]&&logArgs.pop(),logArgs},hiddenMessageLogArgs=new WeakMap;let errorTagNum=0;const errorTags=new WeakMap,tagError=(err,optErrorName=err.name)=>{let errorTag=weakmapGet(errorTags,err);return void 0!==errorTag||(errorTagNum+=1,errorTag=`${optErrorName}#${errorTagNum}`,weakmapSet(errorTags,err,errorTag)),errorTag},makeError=(optDetails=redactedDetails`Assert failed`,ErrorConstructor=Error,{errorName:errorName}={})=>{"string"==typeof optDetails&&(optDetails=redactedDetails([optDetails]));const hiddenDetails=hiddenDetailsMap.get(optDetails);if(void 0===hiddenDetails)throw new Error("unrecognized details "+quote(optDetails));const error=new ErrorConstructor(getMessageString(hiddenDetails));return hiddenMessageLogArgs.set(error,getLogArgs(hiddenDetails)),void 0!==errorName&&tagError(error,errorName),error};freeze(makeError);const hiddenNoteLogArgsArrays=new WeakMap,hiddenNoteCallbackArrays=new WeakMap,note=(error,detailsNote)=>{"string"==typeof detailsNote&&(detailsNote=redactedDetails([detailsNote]));const hiddenDetails=hiddenDetailsMap.get(detailsNote);if(void 0===hiddenDetails)throw new Error("unrecognized details "+quote(detailsNote));const logArgs=getLogArgs(hiddenDetails),callbacks=hiddenNoteCallbackArrays.get(error);if(void 0!==callbacks)for(const callback of callbacks)callback(error,logArgs);else{const logArgsArray=hiddenNoteLogArgsArrays.get(error);void 0!==logArgsArray?logArgsArray.push(logArgs):hiddenNoteLogArgsArrays.set(error,[logArgs])}};freeze(note);const loggedErrorHandler={getStackString:globalThis.getStackString||(error=>{if(!("stack"in error))return"";const stackString=""+error.stack,pos=stackString.indexOf("\n");return stackString.startsWith(" ")||-1===pos?stackString:stackString.slice(pos+1)}),tagError:error=>tagError(error),resetErrorTagNum:()=>{errorTagNum=0},getMessageLogArgs:error=>hiddenMessageLogArgs.get(error),takeMessageLogArgs:error=>{const result=hiddenMessageLogArgs.get(error);return hiddenMessageLogArgs.delete(error),result},takeNoteLogArgsArray:(error,callback)=>{const result=hiddenNoteLogArgsArrays.get(error);if(hiddenNoteLogArgsArrays.delete(error),void 0!==callback){const callbacks=hiddenNoteCallbackArrays.get(error);callbacks?callbacks.push(callback):hiddenNoteCallbackArrays.set(error,[callback])}return result||[]}};$h‍_once.loggedErrorHandler(loggedErrorHandler),freeze(loggedErrorHandler);const makeAssert=(optRaise,unredacted=!1)=>{const details=unredacted?unredactedDetails:redactedDetails,fail=(optDetails=details`Assert failed`,ErrorConstructor=Error)=>{const reason=makeError(optDetails,ErrorConstructor);throw void 0!==optRaise&&optRaise(reason),reason};function baseAssert(flag,optDetails=details`Check failed`,ErrorConstructor=Error){if(!flag)throw fail(optDetails,ErrorConstructor)}freeze(fail);const equal=(actual,expected,optDetails=details`Expected ${actual} is same as ${expected}`,ErrorConstructor=RangeError)=>{baseAssert(is(actual,expected),optDetails,ErrorConstructor)};freeze(equal);const assertTypeof=(specimen,typename,optDetails)=>{baseAssert("string"==typeof typename,details`${quote(typename)} must be a string`),void 0===optDetails&&(optDetails=details([""," must be "+an(typename)],specimen)),equal(typeof specimen,typename,optDetails,TypeError)};freeze(assertTypeof);const assert=assign(baseAssert,{error:makeError,fail:fail,equal:equal,typeof:assertTypeof,string:(specimen,optDetails)=>assertTypeof(specimen,"string",optDetails),note:note,details:details,quote:quote,makeAssert:makeAssert});return freeze(assert)};$h‍_once.makeAssert(makeAssert),freeze(makeAssert);const assert=makeAssert();$h‍_once.assert(assert)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let FERAL_FUNCTION,arrayJoin;$h‍_imports([["./commons.js",[["FERAL_FUNCTION",[$h‍_a=>FERAL_FUNCTION=$h‍_a]],["arrayJoin",[$h‍_a=>arrayJoin=$h‍_a]]]]]);$h‍_once.makeEvaluateFactory((constants=[])=>{const optimizer=function(constants){return 0===constants.length?"":`const {${arrayJoin(constants,",")}} = this;`}(constants);return FERAL_FUNCTION(`\n    with (this) {\n      ${optimizer}\n      return function() {\n        'use strict';\n        return eval(arguments[0]);\n      };\n    }\n  `)})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let arrayIncludes,getOwnPropertyDescriptor,getOwnPropertyNames,objectHasOwnProperty,regexpTest;$h‍_imports([["./commons.js",[["arrayIncludes",[$h‍_a=>arrayIncludes=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["getOwnPropertyNames",[$h‍_a=>getOwnPropertyNames=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["regexpTest",[$h‍_a=>regexpTest=$h‍_a]]]]]);const keywords=["await","break","case","catch","class","const","continue","debugger","default","delete","do","else","export","extends","finally","for","function","if","import","in","instanceof","new","return","super","switch","this","throw","try","typeof","var","void","while","with","yield","let","static","enum","implements","package","protected","interface","private","public","await","null","true","false","this","arguments"],identifierPattern=/^[a-zA-Z_$][\w$]*$/,isValidIdentifierName=name=>"eval"!==name&&!arrayIncludes(keywords,name)&&regexpTest(identifierPattern,name);function isImmutableDataProperty(obj,name){const desc=getOwnPropertyDescriptor(obj,name);return!1===desc.configurable&&!1===desc.writable&&objectHasOwnProperty(desc,"value")}$h‍_once.isValidIdentifierName(isValidIdentifierName);$h‍_once.getScopeConstants((globalObject,localObject={})=>{const globalNames=getOwnPropertyNames(globalObject),localNames=getOwnPropertyNames(localObject),localConstants=localNames.filter(name=>isValidIdentifierName(name)&&isImmutableDataProperty(localObject,name));return[...globalNames.filter(name=>!localNames.includes(name)&&isValidIdentifierName(name)&&isImmutableDataProperty(globalObject,name)),...localConstants]})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,FERAL_EVAL,Proxy,String,freeze,getOwnPropertyDescriptor,globalThis,immutableObject,objectHasOwnProperty,reflectGet,reflectSet,assert;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["FERAL_EVAL",[$h‍_a=>FERAL_EVAL=$h‍_a]],["Proxy",[$h‍_a=>Proxy=$h‍_a]],["String",[$h‍_a=>String=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["globalThis",[$h‍_a=>globalThis=$h‍_a]],["immutableObject",[$h‍_a=>immutableObject=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["reflectGet",[$h‍_a=>reflectGet=$h‍_a]],["reflectSet",[$h‍_a=>reflectSet=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);const{details:d,quote:q}=assert,alwaysThrowHandler=new Proxy(immutableObject,{get(_shadow,prop){assert.fail(d`Please report unexpected scope handler trap: ${q(String(prop))}`)}});$h‍_once.createScopeHandler((globalObject,localObject={},{sloppyGlobalsMode:sloppyGlobalsMode=!1}={})=>{let allowNextEvalToBeUnsafe=!1;return{admitOneUnsafeEvalNext:()=>{allowNextEvalToBeUnsafe=!0},resetOneUnsafeEvalNext:()=>{const wasSet=allowNextEvalToBeUnsafe;return allowNextEvalToBeUnsafe=!1,wasSet},scopeHandler:freeze({__proto__:alwaysThrowHandler,get(_shadow,prop){if("symbol"!=typeof prop)return"eval"===prop&&!0===allowNextEvalToBeUnsafe?(allowNextEvalToBeUnsafe=!1,FERAL_EVAL):prop in localObject?reflectGet(localObject,prop,globalObject):reflectGet(globalObject,prop)},set(_shadow,prop,value){if(prop in localObject){const desc=getOwnPropertyDescriptor(localObject,prop);return objectHasOwnProperty(desc,"value")?reflectSet(localObject,prop,value):reflectSet(localObject,prop,value,globalObject)}return reflectSet(globalObject,prop,value)},has:(_shadow,prop)=>sloppyGlobalsMode||"eval"===prop||prop in localObject||prop in globalObject||prop in globalThis,getPrototypeOf:()=>null,getOwnPropertyDescriptor(_target,prop){const quotedProp=q(String(prop));console.warn("getOwnPropertyDescriptor trap on scopeHandler for "+quotedProp,(new Error).stack)}})}})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let RegExp;$h‍_imports([["./commons.js",[["RegExp",[$h‍_a=>RegExp=$h‍_a]]]]]);const sourceMetaEntriesRegExp=new RegExp("(?:\\s*//\\s*[@#]\\s*([a-zA-Z][a-zA-Z0-9]*)\\s*=\\s*([^\\s\\*]*)|/\\*\\s*[@#]\\s*([a-zA-Z][a-zA-Z0-9]*)\\s*=\\s*([^\\s\\*]*)\\s*\\*/)\\s*$");$h‍_once.getSourceURL(src=>{let sourceURL="<unknown>";for(;src.length>0;){const match=sourceMetaEntriesRegExp.exec(src);if(null===match)break;src=src.slice(0,src.length-match[0].length),"sourceURL"===match[3]?sourceURL=match[4]:"sourceURL"===match[1]&&(sourceURL=match[2])}return sourceURL})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let RegExp,SyntaxError,stringSearch,stringSlice,stringSplit,getSourceURL;function getLineNumber(src,pattern){const index=stringSearch(src,pattern);if(index<0)return-1;const adjustment="\n"===src[index]?1:0;return stringSplit(stringSlice(src,0,index),"\n").length+adjustment}$h‍_imports([["./commons.js",[["RegExp",[$h‍_a=>RegExp=$h‍_a]],["SyntaxError",[$h‍_a=>SyntaxError=$h‍_a]],["stringSearch",[$h‍_a=>stringSearch=$h‍_a]],["stringSlice",[$h‍_a=>stringSlice=$h‍_a]],["stringSplit",[$h‍_a=>stringSplit=$h‍_a]]]],["./get-source-url.js",[["getSourceURL",[$h‍_a=>getSourceURL=$h‍_a]]]]]);const htmlCommentPattern=new RegExp("(?:\x3c!--|--\x3e)","g"),rejectHtmlComments=src=>{const lineNumber=getLineNumber(src,htmlCommentPattern);if(lineNumber<0 || true)return src;const name=getSourceURL(src);throw new SyntaxError(`Possible HTML comment rejected at ${name}:${lineNumber}. (SES_HTML_COMMENT_REJECTED)`)};$h‍_once.rejectHtmlComments(rejectHtmlComments);$h‍_once.evadeHtmlCommentTest(src=>src.replace(htmlCommentPattern,match=>"<"===match[0]?"< ! --":"-- >"));const importPattern=new RegExp("(^|[^.])\\bimport(\\s*(?:\\(|/[/*]))","g"),rejectImportExpressions=src=>{const lineNumber=getLineNumber(src,importPattern);if(lineNumber<0)return src;const name=getSourceURL(src);throw new SyntaxError(`Possible import expression rejected at ${name}:${lineNumber}. (SES_IMPORT_REJECTED)`)};$h‍_once.rejectImportExpressions(rejectImportExpressions);$h‍_once.evadeImportExpressionTest(src=>src.replace(importPattern,(_,p1,p2)=>`${p1}__import__${p2}`));const someDirectEvalPattern=new RegExp("(^|[^.])\\beval(\\s*\\()","g");$h‍_once.rejectSomeDirectEvalExpressions(src=>{const lineNumber=getLineNumber(src,someDirectEvalPattern);if(lineNumber<0)return src;const name=getSourceURL(src);throw new SyntaxError(`Possible direct eval expression rejected at ${name}:${lineNumber}. (SES_EVAL_REJECTED)`)});$h‍_once.mandatoryTransforms(source=>(source=rejectHtmlComments(source),source=rejectImportExpressions(source)));$h‍_once.applyTransforms((source,transforms)=>{for(const transform of transforms)source=transform(source);return source})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let WeakSet,apply,immutableObject,proxyRevocable,weaksetAdd,getScopeConstants,createScopeHandler,applyTransforms,mandatoryTransforms,makeEvaluateFactory,assert;$h‍_imports([["./commons.js",[["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["apply",[$h‍_a=>apply=$h‍_a]],["immutableObject",[$h‍_a=>immutableObject=$h‍_a]],["proxyRevocable",[$h‍_a=>proxyRevocable=$h‍_a]],["weaksetAdd",[$h‍_a=>weaksetAdd=$h‍_a]]]],["./scope-constants.js",[["getScopeConstants",[$h‍_a=>getScopeConstants=$h‍_a]]]],["./scope-handler.js",[["createScopeHandler",[$h‍_a=>createScopeHandler=$h‍_a]]]],["./transforms.js",[["applyTransforms",[$h‍_a=>applyTransforms=$h‍_a]],["mandatoryTransforms",[$h‍_a=>mandatoryTransforms=$h‍_a]]]],["./make-evaluate-factory.js",[["makeEvaluateFactory",[$h‍_a=>makeEvaluateFactory=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);const{details:d}=assert;$h‍_once.performEval((source,globalObject,localObject={},{localTransforms:localTransforms=[],globalTransforms:globalTransforms=[],sloppyGlobalsMode:sloppyGlobalsMode=!1,knownScopeProxies:knownScopeProxies=new WeakSet}={})=>{source=applyTransforms(source,[...localTransforms,...globalTransforms,mandatoryTransforms]);const{scopeHandler:scopeHandler,admitOneUnsafeEvalNext:admitOneUnsafeEvalNext,resetOneUnsafeEvalNext:resetOneUnsafeEvalNext}=createScopeHandler(globalObject,localObject,{sloppyGlobalsMode:sloppyGlobalsMode}),scopeProxyRevocable=proxyRevocable(immutableObject,scopeHandler),constants=getScopeConstants(globalObject,localObject),evaluateFactory=makeEvaluateFactory(constants),evaluate=apply(evaluateFactory,scopeProxyRevocable.proxy,[]);let err;admitOneUnsafeEvalNext();try{return weaksetAdd(knownScopeProxies,scopeProxyRevocable.proxy),apply(evaluate,globalObject,[source])}catch(e){throw err=e,e}finally{resetOneUnsafeEvalNext()&&(scopeProxyRevocable.revoke(),assert.fail(d`handler did not reset allowNextEvalToBeUnsafe ${err}`))}})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let performEval;$h‍_imports([["./evaluate.js",[["performEval",[$h‍_a=>performEval=$h‍_a]]]]]);$h‍_once.makeEvalFunction((globalObject,options={})=>source=>"string"!=typeof source?source:performEval(source,globalObject,{},options))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let FERAL_FUNCTION,arrayJoin,arrayPop,defineProperties,getPrototypeOf,performEval,assert;$h‍_imports([["./commons.js",[["FERAL_FUNCTION",[$h‍_a=>FERAL_FUNCTION=$h‍_a]],["arrayJoin",[$h‍_a=>arrayJoin=$h‍_a]],["arrayPop",[$h‍_a=>arrayPop=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]],["getPrototypeOf",[$h‍_a=>getPrototypeOf=$h‍_a]]]],["./evaluate.js",[["performEval",[$h‍_a=>performEval=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);$h‍_once.makeFunctionConstructor((globaObject,options={})=>{const newFunction=function(_body){const bodyText=""+(arrayPop(arguments)||""),parameters=""+arrayJoin(arguments,",");new FERAL_FUNCTION(parameters,""),new FERAL_FUNCTION(bodyText);const src=`(function anonymous(${parameters}\n) {\n${bodyText}\n})`;return performEval(src,globaObject,{},options)};return defineProperties(newFunction,{prototype:{value:FERAL_FUNCTION.prototype,writable:!1,enumerable:!1,configurable:!1}}),assert(getPrototypeOf(FERAL_FUNCTION)===FERAL_FUNCTION.prototype,"Function prototype is the same accross compartments"),assert(getPrototypeOf(newFunction)===FERAL_FUNCTION.prototype,"Function constructor prototype is the same accross compartments"),newFunction})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{$h‍_imports([]);const constantProperties={Infinity:1/0,NaN:NaN,undefined:void 0};$h‍_once.constantProperties(constantProperties);$h‍_once.universalPropertyNames({isFinite:"isFinite",isNaN:"isNaN",parseFloat:"parseFloat",parseInt:"parseInt",decodeURI:"decodeURI",decodeURIComponent:"decodeURIComponent",encodeURI:"encodeURI",encodeURIComponent:"encodeURIComponent",Array:"Array",ArrayBuffer:"ArrayBuffer",BigInt:"BigInt",BigInt64Array:"BigInt64Array",BigUint64Array:"BigUint64Array",Boolean:"Boolean",DataView:"DataView",EvalError:"EvalError",Float32Array:"Float32Array",Float64Array:"Float64Array",Int8Array:"Int8Array",Int16Array:"Int16Array",Int32Array:"Int32Array",Map:"Map",Number:"Number",Object:"Object",Promise:"Promise",Proxy:"Proxy",RangeError:"RangeError",ReferenceError:"ReferenceError",Set:"Set",String:"String",Symbol:"Symbol",SyntaxError:"SyntaxError",TypeError:"TypeError",Uint8Array:"Uint8Array",Uint8ClampedArray:"Uint8ClampedArray",Uint16Array:"Uint16Array",Uint32Array:"Uint32Array",URIError:"URIError",WeakMap:"WeakMap",WeakSet:"WeakSet",JSON:"JSON",Reflect:"Reflect",escape:"escape",unescape:"unescape",lockdown:"lockdown",harden:"harden",HandledPromise:"HandledPromise"});$h‍_once.initialGlobalPropertyNames({Date:"%InitialDate%",Error:"%InitialError%",RegExp:"%InitialRegExp%",Math:"%InitialMath%",getStackString:"%InitialGetStackString%"});$h‍_once.sharedGlobalPropertyNames({Date:"%SharedDate%",Error:"%SharedError%",RegExp:"%SharedRegExp%",Math:"%SharedMath%"});$h‍_once.uniqueGlobalPropertyNames({globalThis:"%UniqueGlobalThis%",eval:"%UniqueEval%",Function:"%UniqueFunction%",Compartment:"%UniqueCompartment%"});const NativeErrors=[EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError];$h‍_once.NativeErrors(NativeErrors);const FunctionInstance={"[[Proto]]":"%FunctionPrototype%",length:"number",name:"string"};$h‍_once.FunctionInstance(FunctionInstance);const fn=FunctionInstance,asyncFn={"[[Proto]]":"%AsyncFunctionPrototype%"},getter={get:fn,set:"undefined"},accessor={get:fn,set:fn};function NativeError(prototype){return{"[[Proto]]":"%SharedError%",prototype:prototype}}function NativeErrorPrototype(constructor){return{"[[Proto]]":"%ErrorPrototype%",constructor:constructor,message:"string",name:"string",toString:!1}}function TypedArray(prototype){return{"[[Proto]]":"%TypedArray%",BYTES_PER_ELEMENT:"number",prototype:prototype}}function TypedArrayPrototype(constructor){return{"[[Proto]]":"%TypedArrayPrototype%",BYTES_PER_ELEMENT:"number",constructor:constructor}}$h‍_once.isAccessorPermit(permit=>permit===getter||permit===accessor);const SharedMath={E:"number",LN10:"number",LN2:"number",LOG10E:"number",LOG2E:"number",PI:"number",SQRT1_2:"number",SQRT2:"number","@@toStringTag":"string",abs:fn,acos:fn,acosh:fn,asin:fn,asinh:fn,atan:fn,atanh:fn,atan2:fn,cbrt:fn,ceil:fn,clz32:fn,cos:fn,cosh:fn,exp:fn,expm1:fn,floor:fn,fround:fn,hypot:fn,imul:fn,log:fn,log1p:fn,log10:fn,log2:fn,max:fn,min:fn,pow:fn,round:fn,sign:fn,sin:fn,sinh:fn,sqrt:fn,tan:fn,tanh:fn,trunc:fn,idiv:!1,idivmod:!1,imod:!1,imuldiv:!1,irem:!1,mod:!1},whitelist={"[[Proto]]":null,"%ThrowTypeError%":fn,Infinity:"number",NaN:"number",undefined:"undefined","%UniqueEval%":fn,isFinite:fn,isNaN:fn,parseFloat:fn,parseInt:fn,decodeURI:fn,decodeURIComponent:fn,encodeURI:fn,encodeURIComponent:fn,Object:{"[[Proto]]":"%FunctionPrototype%",assign:fn,create:fn,defineProperties:fn,defineProperty:fn,entries:fn,freeze:fn,fromEntries:fn,getOwnPropertyDescriptor:fn,getOwnPropertyDescriptors:fn,getOwnPropertyNames:fn,getOwnPropertySymbols:fn,getPrototypeOf:fn,is:fn,isExtensible:fn,isFrozen:fn,isSealed:fn,keys:fn,preventExtensions:fn,prototype:"%ObjectPrototype%",seal:fn,setPrototypeOf:fn,values:fn},"%ObjectPrototype%":{"[[Proto]]":null,constructor:"Object",hasOwnProperty:fn,isPrototypeOf:fn,propertyIsEnumerable:fn,toLocaleString:fn,toString:fn,valueOf:fn,"--proto--":accessor,__defineGetter__:fn,__defineSetter__:fn,__lookupGetter__:fn,__lookupSetter__:fn},"%UniqueFunction%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%FunctionPrototype%"},"%InertFunction%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%FunctionPrototype%"},"%FunctionPrototype%":{apply:fn,bind:fn,call:fn,constructor:"%InertFunction%",toString:fn,"@@hasInstance":fn,caller:!1,arguments:!1},Boolean:{"[[Proto]]":"%FunctionPrototype%",prototype:"%BooleanPrototype%"},"%BooleanPrototype%":{constructor:"Boolean",toString:fn,valueOf:fn},Symbol:{"[[Proto]]":"%FunctionPrototype%",asyncIterator:"symbol",for:fn,hasInstance:"symbol",isConcatSpreadable:"symbol",iterator:"symbol",keyFor:fn,match:"symbol",matchAll:"symbol",prototype:"%SymbolPrototype%",replace:"symbol",search:"symbol",species:"symbol",split:"symbol",toPrimitive:"symbol",toStringTag:"symbol",unscopables:"symbol"},"%SymbolPrototype%":{constructor:"Symbol",description:getter,toString:fn,valueOf:fn,"@@toPrimitive":fn,"@@toStringTag":"string"},"%InitialError%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%ErrorPrototype%",captureStackTrace:fn,stackTraceLimit:accessor,prepareStackTrace:accessor},"%SharedError%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%ErrorPrototype%",captureStackTrace:fn,stackTraceLimit:accessor,prepareStackTrace:accessor},"%ErrorPrototype%":{constructor:"%SharedError%",message:"string",name:"string",toString:fn,at:!1,stack:!1},EvalError:NativeError("%EvalErrorPrototype%"),RangeError:NativeError("%RangeErrorPrototype%"),ReferenceError:NativeError("%ReferenceErrorPrototype%"),SyntaxError:NativeError("%SyntaxErrorPrototype%"),TypeError:NativeError("%TypeErrorPrototype%"),URIError:NativeError("%URIErrorPrototype%"),"%EvalErrorPrototype%":NativeErrorPrototype("EvalError"),"%RangeErrorPrototype%":NativeErrorPrototype("RangeError"),"%ReferenceErrorPrototype%":NativeErrorPrototype("ReferenceError"),"%SyntaxErrorPrototype%":NativeErrorPrototype("SyntaxError"),"%TypeErrorPrototype%":NativeErrorPrototype("TypeError"),"%URIErrorPrototype%":NativeErrorPrototype("URIError"),Number:{"[[Proto]]":"%FunctionPrototype%",EPSILON:"number",isFinite:fn,isInteger:fn,isNaN:fn,isSafeInteger:fn,MAX_SAFE_INTEGER:"number",MAX_VALUE:"number",MIN_SAFE_INTEGER:"number",MIN_VALUE:"number",NaN:"number",NEGATIVE_INFINITY:"number",parseFloat:fn,parseInt:fn,POSITIVE_INFINITY:"number",prototype:"%NumberPrototype%"},"%NumberPrototype%":{constructor:"Number",toExponential:fn,toFixed:fn,toLocaleString:fn,toPrecision:fn,toString:fn,valueOf:fn},BigInt:{"[[Proto]]":"%FunctionPrototype%",asIntN:fn,asUintN:fn,prototype:"%BigIntPrototype%",bitLength:!1,fromArrayBuffer:!1},"%BigIntPrototype%":{constructor:"BigInt",toLocaleString:fn,toString:fn,valueOf:fn,"@@toStringTag":"string"},"%InitialMath%":{...SharedMath,random:fn},"%SharedMath%":SharedMath,"%InitialDate%":{"[[Proto]]":"%FunctionPrototype%",now:fn,parse:fn,prototype:"%DatePrototype%",UTC:fn},"%SharedDate%":{"[[Proto]]":"%FunctionPrototype%",now:fn,parse:fn,prototype:"%DatePrototype%",UTC:fn},"%DatePrototype%":{constructor:"%SharedDate%",getDate:fn,getDay:fn,getFullYear:fn,getHours:fn,getMilliseconds:fn,getMinutes:fn,getMonth:fn,getSeconds:fn,getTime:fn,getTimezoneOffset:fn,getUTCDate:fn,getUTCDay:fn,getUTCFullYear:fn,getUTCHours:fn,getUTCMilliseconds:fn,getUTCMinutes:fn,getUTCMonth:fn,getUTCSeconds:fn,setDate:fn,setFullYear:fn,setHours:fn,setMilliseconds:fn,setMinutes:fn,setMonth:fn,setSeconds:fn,setTime:fn,setUTCDate:fn,setUTCFullYear:fn,setUTCHours:fn,setUTCMilliseconds:fn,setUTCMinutes:fn,setUTCMonth:fn,setUTCSeconds:fn,toDateString:fn,toISOString:fn,toJSON:fn,toLocaleDateString:fn,toLocaleString:fn,toLocaleTimeString:fn,toString:fn,toTimeString:fn,toUTCString:fn,valueOf:fn,"@@toPrimitive":fn,getYear:fn,setYear:fn,toGMTString:fn},String:{"[[Proto]]":"%FunctionPrototype%",fromCharCode:fn,fromCodePoint:fn,prototype:"%StringPrototype%",raw:fn,fromArrayBuffer:!1},"%StringPrototype%":{length:"number",charAt:fn,charCodeAt:fn,codePointAt:fn,concat:fn,constructor:"String",endsWith:fn,includes:fn,indexOf:fn,lastIndexOf:fn,localeCompare:fn,match:fn,matchAll:fn,normalize:fn,padEnd:fn,padStart:fn,repeat:fn,replace:fn,replaceAll:fn,search:fn,slice:fn,split:fn,startsWith:fn,substring:fn,toLocaleLowerCase:fn,toLocaleUpperCase:fn,toLowerCase:fn,toString:fn,toUpperCase:fn,trim:fn,trimEnd:fn,trimStart:fn,valueOf:fn,"@@iterator":fn,substr:fn,anchor:fn,big:fn,blink:fn,bold:fn,fixed:fn,fontcolor:fn,fontsize:fn,italics:fn,link:fn,small:fn,strike:fn,sub:fn,sup:fn,trimLeft:fn,trimRight:fn,compare:!1,at:fn},"%StringIteratorPrototype%":{"[[Proto]]":"%IteratorPrototype%",next:fn,"@@toStringTag":"string"},"%InitialRegExp%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%RegExpPrototype%","@@species":getter,input:!1,$_:!1,lastMatch:!1,"$&":!1,lastParen:!1,"$+":!1,leftContext:!1,"$`":!1,rightContext:!1,"$'":!1,$1:!1,$2:!1,$3:!1,$4:!1,$5:!1,$6:!1,$7:!1,$8:!1,$9:!1},"%SharedRegExp%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%RegExpPrototype%","@@species":getter},"%RegExpPrototype%":{constructor:"%SharedRegExp%",exec:fn,dotAll:getter,flags:getter,global:getter,ignoreCase:getter,"@@match":fn,"@@matchAll":fn,multiline:getter,"@@replace":fn,"@@search":fn,source:getter,"@@split":fn,sticky:getter,test:fn,toString:fn,unicode:getter,compile:!1,hasIndices:!1},"%RegExpStringIteratorPrototype%":{"[[Proto]]":"%IteratorPrototype%",next:fn,"@@toStringTag":"string"},Array:{"[[Proto]]":"%FunctionPrototype%",from:fn,isArray:fn,of:fn,prototype:"%ArrayPrototype%","@@species":getter,at:fn},"%ArrayPrototype%":{length:"number",concat:fn,constructor:"Array",copyWithin:fn,entries:fn,every:fn,fill:fn,filter:fn,find:fn,findIndex:fn,flat:fn,flatMap:fn,forEach:fn,includes:fn,indexOf:fn,join:fn,keys:fn,lastIndexOf:fn,map:fn,pop:fn,push:fn,reduce:fn,reduceRight:fn,reverse:fn,shift:fn,slice:fn,some:fn,sort:fn,splice:fn,toLocaleString:fn,toString:fn,unshift:fn,values:fn,"@@iterator":fn,"@@unscopables":{"[[Proto]]":null,copyWithin:"boolean",entries:"boolean",fill:"boolean",find:"boolean",findIndex:"boolean",flat:"boolean",flatMap:"boolean",includes:"boolean",keys:"boolean",values:"boolean",at:!1},at:!1},"%ArrayIteratorPrototype%":{"[[Proto]]":"%IteratorPrototype%",next:fn,"@@toStringTag":"string"},"%TypedArray%":{"[[Proto]]":"%FunctionPrototype%",from:fn,of:fn,prototype:"%TypedArrayPrototype%","@@species":getter},"%TypedArrayPrototype%":{buffer:getter,byteLength:getter,byteOffset:getter,constructor:"%TypedArray%",copyWithin:fn,entries:fn,every:fn,fill:fn,filter:fn,find:fn,findIndex:fn,forEach:fn,includes:fn,indexOf:fn,join:fn,keys:fn,lastIndexOf:fn,length:getter,map:fn,reduce:fn,reduceRight:fn,reverse:fn,set:fn,slice:fn,some:fn,sort:fn,subarray:fn,toLocaleString:fn,toString:fn,values:fn,"@@iterator":fn,"@@toStringTag":getter,at:!1},BigInt64Array:TypedArray("%BigInt64ArrayPrototype%"),BigUint64Array:TypedArray("%BigUint64ArrayPrototype%"),Float32Array:TypedArray("%Float32ArrayPrototype%"),Float64Array:TypedArray("%Float64ArrayPrototype%"),Int16Array:TypedArray("%Int16ArrayPrototype%"),Int32Array:TypedArray("%Int32ArrayPrototype%"),Int8Array:TypedArray("%Int8ArrayPrototype%"),Uint16Array:TypedArray("%Uint16ArrayPrototype%"),Uint32Array:TypedArray("%Uint32ArrayPrototype%"),Uint8Array:TypedArray("%Uint8ArrayPrototype%"),Uint8ClampedArray:TypedArray("%Uint8ClampedArrayPrototype%"),"%BigInt64ArrayPrototype%":TypedArrayPrototype("BigInt64Array"),"%BigUint64ArrayPrototype%":TypedArrayPrototype("BigUint64Array"),"%Float32ArrayPrototype%":TypedArrayPrototype("Float32Array"),"%Float64ArrayPrototype%":TypedArrayPrototype("Float64Array"),"%Int16ArrayPrototype%":TypedArrayPrototype("Int16Array"),"%Int32ArrayPrototype%":TypedArrayPrototype("Int32Array"),"%Int8ArrayPrototype%":TypedArrayPrototype("Int8Array"),"%Uint16ArrayPrototype%":TypedArrayPrototype("Uint16Array"),"%Uint32ArrayPrototype%":TypedArrayPrototype("Uint32Array"),"%Uint8ArrayPrototype%":TypedArrayPrototype("Uint8Array"),"%Uint8ClampedArrayPrototype%":TypedArrayPrototype("Uint8ClampedArray"),Map:{"[[Proto]]":"%FunctionPrototype%","@@species":getter,prototype:"%MapPrototype%"},"%MapPrototype%":{clear:fn,constructor:"Map",delete:fn,entries:fn,forEach:fn,get:fn,has:fn,keys:fn,set:fn,size:getter,values:fn,"@@iterator":fn,"@@toStringTag":"string"},"%MapIteratorPrototype%":{"[[Proto]]":"%IteratorPrototype%",next:fn,"@@toStringTag":"string"},Set:{"[[Proto]]":"%FunctionPrototype%",prototype:"%SetPrototype%","@@species":getter},"%SetPrototype%":{add:fn,clear:fn,constructor:"Set",delete:fn,entries:fn,forEach:fn,has:fn,keys:fn,size:getter,values:fn,"@@iterator":fn,"@@toStringTag":"string"},"%SetIteratorPrototype%":{"[[Proto]]":"%IteratorPrototype%",next:fn,"@@toStringTag":"string"},WeakMap:{"[[Proto]]":"%FunctionPrototype%",prototype:"%WeakMapPrototype%"},"%WeakMapPrototype%":{constructor:"WeakMap",delete:fn,get:fn,has:fn,set:fn,"@@toStringTag":"string"},WeakSet:{"[[Proto]]":"%FunctionPrototype%",prototype:"%WeakSetPrototype%"},"%WeakSetPrototype%":{add:fn,constructor:"WeakSet",delete:fn,has:fn,"@@toStringTag":"string"},ArrayBuffer:{"[[Proto]]":"%FunctionPrototype%",isView:fn,prototype:"%ArrayBufferPrototype%","@@species":getter,fromString:!1,fromBigInt:!1},"%ArrayBufferPrototype%":{byteLength:getter,constructor:"ArrayBuffer",slice:fn,"@@toStringTag":"string",concat:!1},SharedArrayBuffer:!1,"%SharedArrayBufferPrototype%":!1,DataView:{"[[Proto]]":"%FunctionPrototype%",BYTES_PER_ELEMENT:"number",prototype:"%DataViewPrototype%"},"%DataViewPrototype%":{buffer:getter,byteLength:getter,byteOffset:getter,constructor:"DataView",getBigInt64:fn,getBigUint64:fn,getFloat32:fn,getFloat64:fn,getInt8:fn,getInt16:fn,getInt32:fn,getUint8:fn,getUint16:fn,getUint32:fn,setBigInt64:fn,setBigUint64:fn,setFloat32:fn,setFloat64:fn,setInt8:fn,setInt16:fn,setInt32:fn,setUint8:fn,setUint16:fn,setUint32:fn,"@@toStringTag":"string"},Atomics:!1,JSON:{parse:fn,stringify:fn,"@@toStringTag":"string"},"%IteratorPrototype%":{"@@iterator":fn},"%AsyncIteratorPrototype%":{"@@asyncIterator":fn},"%InertGeneratorFunction%":{"[[Proto]]":"%InertFunction%",prototype:"%Generator%"},"%Generator%":{"[[Proto]]":"%FunctionPrototype%",constructor:"%InertGeneratorFunction%",prototype:"%GeneratorPrototype%","@@toStringTag":"string"},"%InertAsyncGeneratorFunction%":{"[[Proto]]":"%InertFunction%",prototype:"%AsyncGenerator%"},"%AsyncGenerator%":{"[[Proto]]":"%FunctionPrototype%",constructor:"%InertAsyncGeneratorFunction%",prototype:"%AsyncGeneratorPrototype%","@@toStringTag":"string"},"%GeneratorPrototype%":{"[[Proto]]":"%IteratorPrototype%",constructor:"%Generator%",next:fn,return:fn,throw:fn,"@@toStringTag":"string"},"%AsyncGeneratorPrototype%":{"[[Proto]]":"%AsyncIteratorPrototype%",constructor:"%AsyncGenerator%",next:fn,return:fn,throw:fn,"@@toStringTag":"string"},HandledPromise:{"[[Proto]]":"Promise",applyFunction:fn,applyFunctionSendOnly:fn,applyMethod:fn,applyMethodSendOnly:fn,get:fn,getSendOnly:fn,prototype:"%PromisePrototype%",resolve:fn},Promise:{"[[Proto]]":"%FunctionPrototype%",all:fn,allSettled:fn,any:!1,prototype:"%PromisePrototype%",race:fn,reject:fn,resolve:fn,"@@species":getter},"%PromisePrototype%":{catch:fn,constructor:"Promise",finally:fn,then:fn,"@@toStringTag":"string"},"%InertAsyncFunction%":{"[[Proto]]":"%InertFunction%",prototype:"%AsyncFunctionPrototype%"},"%AsyncFunctionPrototype%":{"[[Proto]]":"%FunctionPrototype%",constructor:"%InertAsyncFunction%","@@toStringTag":"string"},Reflect:{apply:fn,construct:fn,defineProperty:fn,deleteProperty:fn,get:fn,getOwnPropertyDescriptor:fn,getPrototypeOf:fn,has:fn,isExtensible:fn,ownKeys:fn,preventExtensions:fn,set:fn,setPrototypeOf:fn,"@@toStringTag":"string"},Proxy:{"[[Proto]]":"%FunctionPrototype%",revocable:fn},escape:fn,unescape:fn,"%UniqueCompartment%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%CompartmentPrototype%",toString:fn},"%InertCompartment%":{"[[Proto]]":"%FunctionPrototype%",prototype:"%CompartmentPrototype%",toString:fn},"%CompartmentPrototype%":{constructor:"%InertCompartment%",evaluate:fn,globalThis:getter,name:getter,toString:fn,__isKnownScopeProxy__:fn,import:asyncFn,load:asyncFn,importNow:fn,module:fn},lockdown:fn,harden:fn,"%InitialGetStackString%":fn};$h‍_once.whitelist(whitelist)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let defineProperty,objectHasOwnProperty,entries,makeEvalFunction,makeFunctionConstructor,constantProperties,universalPropertyNames;$h‍_imports([["./commons.js",[["defineProperty",[$h‍_a=>defineProperty=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["entries",[$h‍_a=>entries=$h‍_a]]]],["./make-eval-function.js",[["makeEvalFunction",[$h‍_a=>makeEvalFunction=$h‍_a]]]],["./make-function-constructor.js",[["makeFunctionConstructor",[$h‍_a=>makeFunctionConstructor=$h‍_a]]]],["./whitelist.js",[["constantProperties",[$h‍_a=>constantProperties=$h‍_a]],["universalPropertyNames",[$h‍_a=>universalPropertyNames=$h‍_a]]]]]);$h‍_once.initGlobalObject((globalObject,intrinsics,newGlobalPropertyNames,makeCompartmentConstructor,compartmentPrototype,{globalTransforms:globalTransforms,markVirtualizedNativeFunction:markVirtualizedNativeFunction})=>{for(const[name,constant]of entries(constantProperties))defineProperty(globalObject,name,{value:constant,writable:!1,enumerable:!1,configurable:!1});for(const[name,intrinsicName]of entries(universalPropertyNames))objectHasOwnProperty(intrinsics,intrinsicName)&&defineProperty(globalObject,name,{value:intrinsics[intrinsicName],writable:!0,enumerable:!1,configurable:!0});for(const[name,intrinsicName]of entries(newGlobalPropertyNames))objectHasOwnProperty(intrinsics,intrinsicName)&&defineProperty(globalObject,name,{value:intrinsics[intrinsicName],writable:!0,enumerable:!1,configurable:!0});const perCompartmentGlobals={globalThis:globalObject,eval:makeEvalFunction(globalObject,{globalTransforms:globalTransforms}),Function:makeFunctionConstructor(globalObject,{globalTransforms:globalTransforms})};perCompartmentGlobals.Compartment=makeCompartmentConstructor(makeCompartmentConstructor,intrinsics,markVirtualizedNativeFunction);for(const[name,value]of entries(perCompartmentGlobals))defineProperty(globalObject,name,{value:value,writable:!0,enumerable:!1,configurable:!0}),"function"==typeof value&&markVirtualizedNativeFunction(value)})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Promise,TypeError,ReferenceError,create,values,freeze,assert;$h‍_imports([["./commons.js",[["Promise",[$h‍_a=>Promise=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["ReferenceError",[$h‍_a=>ReferenceError=$h‍_a]],["create",[$h‍_a=>create=$h‍_a]],["values",[$h‍_a=>values=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);const{details:d,quote:q}=assert;$h‍_once.makeAlias((compartment,specifier)=>freeze({compartment:compartment,specifier:specifier}));const loadRecord=async(compartmentPrivateFields,moduleAliases,compartment,moduleSpecifier,staticModuleRecord)=>{const{resolveHook:resolveHook,moduleRecords:moduleRecords}=compartmentPrivateFields.get(compartment),resolvedImports=((imports,resolveHook,fullReferrerSpecifier)=>{const resolvedImports=create(null);for(const importSpecifier of imports){const fullSpecifier=resolveHook(importSpecifier,fullReferrerSpecifier);resolvedImports[importSpecifier]=fullSpecifier}return freeze(resolvedImports)})(staticModuleRecord.imports,resolveHook,moduleSpecifier),moduleRecord=freeze({compartment:compartment,staticModuleRecord:staticModuleRecord,moduleSpecifier:moduleSpecifier,resolvedImports:resolvedImports});return moduleRecords.set(moduleSpecifier,moduleRecord),await Promise.all(values(resolvedImports).map(fullSpecifier=>load(compartmentPrivateFields,moduleAliases,compartment,fullSpecifier))),moduleRecord},load=async(compartmentPrivateFields,moduleAliases,compartment,moduleSpecifier)=>(async(compartmentPrivateFields,moduleAliases,compartment,moduleSpecifier)=>{const{importHook:importHook,moduleMap:moduleMap,moduleMapHook:moduleMapHook,moduleRecords:moduleRecords}=compartmentPrivateFields.get(compartment);let aliasNamespace=moduleMap[moduleSpecifier];if(void 0===aliasNamespace&&void 0!==moduleMapHook&&(aliasNamespace=moduleMapHook(moduleSpecifier)),"string"==typeof aliasNamespace)assert.fail(d`Cannot map module ${q(moduleSpecifier)} to ${q(aliasNamespace)} in parent compartment, not yet implemented`,TypeError);else if(void 0!==aliasNamespace){const alias=moduleAliases.get(aliasNamespace);void 0===alias&&assert.fail(d`Cannot map module ${q(moduleSpecifier)} because the value is not a module exports namespace, or is from another realm`,ReferenceError);const aliasRecord=await load(compartmentPrivateFields,moduleAliases,alias.compartment,alias.specifier);return moduleRecords.set(moduleSpecifier,aliasRecord),aliasRecord}if(moduleRecords.has(moduleSpecifier))return moduleRecords.get(moduleSpecifier);const staticModuleRecord=await importHook(moduleSpecifier);if(null!==staticModuleRecord&&"object"==typeof staticModuleRecord||assert.fail(d`importHook must return a promise for an object, for module ${q(moduleSpecifier)} in compartment ${q(compartment.name)}`),void 0!==staticModuleRecord.record){const{compartment:aliasCompartment=compartment,specifier:aliasSpecifier=moduleSpecifier,record:aliasModuleRecord}=staticModuleRecord,aliasRecord=await loadRecord(compartmentPrivateFields,moduleAliases,aliasCompartment,aliasSpecifier,aliasModuleRecord);return moduleRecords.set(moduleSpecifier,aliasRecord),aliasRecord}return loadRecord(compartmentPrivateFields,moduleAliases,compartment,moduleSpecifier,staticModuleRecord)})(compartmentPrivateFields,moduleAliases,compartment,moduleSpecifier).catch(error=>{const{name:name}=compartmentPrivateFields.get(compartment);throw assert.note(error,d`${error.message}, loading ${q(moduleSpecifier)} in compartment ${q(name)}`),error});$h‍_once.load(load)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let makeAlias,Proxy,TypeError,create,freeze,ownKeys,reflectGet,reflectGetOwnPropertyDescriptor,reflectHas,reflectIsExtensible,reflectPreventExtensions,assert;$h‍_imports([["./module-load.js",[["makeAlias",[$h‍_a=>makeAlias=$h‍_a]]]],["./commons.js",[["Proxy",[$h‍_a=>Proxy=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["create",[$h‍_a=>create=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["ownKeys",[$h‍_a=>ownKeys=$h‍_a]],["reflectGet",[$h‍_a=>reflectGet=$h‍_a]],["reflectGetOwnPropertyDescriptor",[$h‍_a=>reflectGetOwnPropertyDescriptor=$h‍_a]],["reflectHas",[$h‍_a=>reflectHas=$h‍_a]],["reflectIsExtensible",[$h‍_a=>reflectIsExtensible=$h‍_a]],["reflectPreventExtensions",[$h‍_a=>reflectPreventExtensions=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);const{quote:q}=assert,deferExports=()=>{let active=!1;const proxiedExports=create(null);return freeze({activate(){active=!0},proxiedExports:proxiedExports,exportsProxy:new Proxy(proxiedExports,{get(_target,name,receiver){if(!active)throw new TypeError(`Cannot get property ${q(name)} of module exports namespace, the module has not yet begun to execute`);return reflectGet(proxiedExports,name,receiver)},set(_target,name,_value){throw new TypeError(`Cannot set property ${q(name)} of module exports namespace`)},has(_target,name){if(!active)throw new TypeError(`Cannot check property ${q(name)}, the module has not yet begun to execute`);return reflectHas(proxiedExports,name)},deleteProperty(_target,name){throw new TypeError(`Cannot delete property ${q(name)}s of module exports namespace`)},ownKeys(_target){if(!active)throw new TypeError("Cannot enumerate keys, the module has not yet begun to execute");return ownKeys(proxiedExports)},getOwnPropertyDescriptor(_target,name){if(!active)throw new TypeError(`Cannot get own property descriptor ${q(name)}, the module has not yet begun to execute`);return reflectGetOwnPropertyDescriptor(proxiedExports,name)},preventExtensions(_target){if(!active)throw new TypeError("Cannot prevent extensions of module exports namespace, the module has not yet begun to execute");return reflectPreventExtensions(proxiedExports)},isExtensible(){if(!active)throw new TypeError("Cannot check extensibility of module exports namespace, the module has not yet begun to execute");return reflectIsExtensible(proxiedExports)},getPrototypeOf:_target=>null,setPrototypeOf(_target,_proto){throw new TypeError("Cannot set prototype of module exports namespace")},defineProperty(_target,name,_descriptor){throw new TypeError(`Cannot define property ${q(name)} of module exports namespace`)},apply(_target,_thisArg,_args){throw new TypeError("Cannot call module exports namespace, it is not a function")},construct(_target,_args){throw new TypeError("Cannot construct module exports namespace, it is not a constructor")}})})};$h‍_once.deferExports(deferExports);$h‍_once.getDeferredExports((compartment,compartmentPrivateFields,moduleAliases,specifier)=>{const{deferredExports:deferredExports}=compartmentPrivateFields;if(!deferredExports.has(specifier)){const deferred=deferExports();moduleAliases.set(deferred.exportsProxy,makeAlias(compartment,specifier)),deferredExports.set(specifier,deferred)}return deferredExports.get(specifier)})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let assert,getDeferredExports,Error,ReferenceError,SyntaxError,TypeError,create,defineProperty,entries,freeze,isArray,keys;$h‍_imports([["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]],["./module-proxy.js",[["getDeferredExports",[$h‍_a=>getDeferredExports=$h‍_a]]]],["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["ReferenceError",[$h‍_a=>ReferenceError=$h‍_a]],["SyntaxError",[$h‍_a=>SyntaxError=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["create",[$h‍_a=>create=$h‍_a]],["defineProperty",[$h‍_a=>defineProperty=$h‍_a]],["entries",[$h‍_a=>entries=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["isArray",[$h‍_a=>isArray=$h‍_a]],["keys",[$h‍_a=>keys=$h‍_a]]]]]);const{quote:q}=assert;$h‍_once.makeThirdPartyModuleInstance((compartmentPrivateFields,staticModuleRecord,compartment,moduleAliases,moduleSpecifier,resolvedImports)=>{const{exportsProxy:exportsProxy,proxiedExports:proxiedExports,activate:activate}=getDeferredExports(compartment,compartmentPrivateFields.get(compartment),moduleAliases,moduleSpecifier),notifiers=create(null);if(staticModuleRecord.exports){if(!isArray(staticModuleRecord.exports)||staticModuleRecord.exports.some(name=>"string"!=typeof name))throw new TypeError('SES third-party static module record "exports" property must be an array of strings for module '+moduleSpecifier);staticModuleRecord.exports.forEach(name=>{let value=proxiedExports[name];const updaters=[];defineProperty(proxiedExports,name,{get:()=>value,set:newValue=>{value=newValue;for(const updater of updaters)updater(newValue)},enumerable:!0,configurable:!1}),notifiers[name]=update=>{updaters.push(update),update(value)}})}let activated=!1;return freeze({notifiers:notifiers,exportsProxy:exportsProxy,execute(){activated||(activate(),activated=!0,staticModuleRecord.execute(proxiedExports,compartment,resolvedImports))}})});$h‍_once.makeModuleInstance((privateFields,moduleAliases,moduleRecord,importedInstances)=>{const{compartment:compartment,moduleSpecifier:moduleSpecifier,staticModuleRecord:staticModuleRecord}=moduleRecord,{reexports:exportAlls=[],__syncModuleProgram__:functorSource,__fixedExportMap__:fixedExportMap={},__liveExportMap__:liveExportMap={}}=staticModuleRecord,compartmentFields=privateFields.get(compartment),{__shimTransforms__:__shimTransforms__}=compartmentFields,{exportsProxy:exportsProxy,proxiedExports:proxiedExports,activate:activate}=getDeferredExports(compartment,compartmentFields,moduleAliases,moduleSpecifier),exportsProps=create(null),localLexicals=create(null),onceVar=create(null),liveVar=create(null),localGetNotify=create(null),notifiers=create(null);entries(fixedExportMap).forEach(([fixedExportName,[localName]])=>{let fixedGetNotify=localGetNotify[localName];if(!fixedGetNotify){let value,tdz=!0,optUpdaters=[];const get=()=>{if(tdz)throw new ReferenceError(`binding ${q(localName)} not yet initialized`);return value},init=freeze(initValue=>{if(!tdz)throw new Error(`Internal: binding ${q(localName)} already initialized`);value=initValue;const updaters=optUpdaters;optUpdaters=null,tdz=!1;for(const updater of updaters)updater(initValue);return initValue});fixedGetNotify={get:get,notify:updater=>{updater!==init&&(tdz?optUpdaters.push(updater):updater(value))}},localGetNotify[localName]=fixedGetNotify,onceVar[localName]=init}exportsProps[fixedExportName]={get:fixedGetNotify.get,set:void 0,enumerable:!0,configurable:!1},notifiers[fixedExportName]=fixedGetNotify.notify}),entries(liveExportMap).forEach(([liveExportName,[localName,setProxyTrap]])=>{let liveGetNotify=localGetNotify[localName];if(!liveGetNotify){let value,tdz=!0;const updaters=[],get=()=>{if(tdz)throw new ReferenceError(`binding ${q(liveExportName)} not yet initialized`);return value},update=freeze(newValue=>{value=newValue,tdz=!1;for(const updater of updaters)updater(newValue)}),set=newValue=>{if(tdz)throw new ReferenceError(`binding ${q(localName)} not yet initialized`);value=newValue;for(const updater of updaters)updater(newValue)};liveGetNotify={get:get,notify:updater=>{updater!==update&&(updaters.push(updater),tdz||updater(value))}},localGetNotify[localName]=liveGetNotify,setProxyTrap&&defineProperty(localLexicals,localName,{get:get,set:set,enumerable:!0,configurable:!1}),liveVar[localName]=update}exportsProps[liveExportName]={get:liveGetNotify.get,set:void 0,enumerable:!0,configurable:!1},notifiers[liveExportName]=liveGetNotify.notify});function imports(updateRecord){const candidateAll=create(null);candidateAll.default=!1;for(const[specifier,importUpdaters]of updateRecord){const instance=importedInstances.get(specifier);instance.execute();const{notifiers:importNotifiers}=instance;for(const[importName,updaters]of importUpdaters){const importNotify=importNotifiers[importName];if(!importNotify)throw SyntaxError(`The requested module '${specifier}' does not provide an export named '${importName}'`);for(const updater of updaters)importNotify(updater)}if(exportAlls.includes(specifier))for(const[importName,importNotify]of entries(importNotifiers))void 0===candidateAll[importName]?candidateAll[importName]=importNotify:candidateAll[importName]=!1}for(const[importName,notify]of entries(candidateAll))if(!notifiers[importName]&&!1!==notify){let value;notifiers[importName]=notify;notify(newValue=>value=newValue),exportsProps[importName]={get:()=>value,set:void 0,enumerable:!0,configurable:!1}}keys(exportsProps).sort().forEach(k=>defineProperty(proxiedExports,k,exportsProps[k])),freeze(proxiedExports),activate()}notifiers["*"]=update=>{update(proxiedExports)};let thrownError,optFunctor=compartment.evaluate(functorSource,{globalObject:compartment.globalThis,transforms:__shimTransforms__,__moduleShimLexicals__:localLexicals}),didThrow=!1;return freeze({notifiers:notifiers,exportsProxy:exportsProxy,execute:function(){if(optFunctor){const functor=optFunctor;optFunctor=null;try{functor(freeze({imports:freeze(imports),onceVar:freeze(onceVar),liveVar:freeze(liveVar)}))}catch(e){didThrow=!0,thrownError=e}}if(didThrow)throw thrownError}})})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let assert,makeModuleInstance,makeThirdPartyModuleInstance,Error,Map,ReferenceError,entries,isArray,isObject,mapGet,mapHas,mapSet,weakmapGet;$h‍_imports([["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]],["./module-instance.js",[["makeModuleInstance",[$h‍_a=>makeModuleInstance=$h‍_a]],["makeThirdPartyModuleInstance",[$h‍_a=>makeThirdPartyModuleInstance=$h‍_a]]]],["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Map",[$h‍_a=>Map=$h‍_a]],["ReferenceError",[$h‍_a=>ReferenceError=$h‍_a]],["entries",[$h‍_a=>entries=$h‍_a]],["isArray",[$h‍_a=>isArray=$h‍_a]],["isObject",[$h‍_a=>isObject=$h‍_a]],["mapGet",[$h‍_a=>mapGet=$h‍_a]],["mapHas",[$h‍_a=>mapHas=$h‍_a]],["mapSet",[$h‍_a=>mapSet=$h‍_a]],["weakmapGet",[$h‍_a=>weakmapGet=$h‍_a]]]]]);const{quote:q}=assert,link=(compartmentPrivateFields,moduleAliases,compartment,moduleSpecifier)=>{const{moduleRecords:moduleRecords}=weakmapGet(compartmentPrivateFields,compartment),moduleRecord=mapGet(moduleRecords,moduleSpecifier);if(void 0===moduleRecord)throw new ReferenceError("Missing link to module "+q(moduleSpecifier));return instantiate(compartmentPrivateFields,moduleAliases,moduleRecord)};$h‍_once.link(link);const instantiate=(compartmentPrivateFields,moduleAliases,moduleRecord)=>{const{compartment:compartment,moduleSpecifier:moduleSpecifier,resolvedImports:resolvedImports,staticModuleRecord:staticModuleRecord}=moduleRecord,{instances:instances}=weakmapGet(compartmentPrivateFields,compartment);if(mapHas(instances,moduleSpecifier))return mapGet(instances,moduleSpecifier);!function(staticModuleRecord,moduleSpecifier){assert(isObject(staticModuleRecord),`Static module records must be of type object, got ${q(staticModuleRecord)}, for module ${q(moduleSpecifier)}`);const{imports:imports,exports:exports,reexports:reexports=[]}=staticModuleRecord;assert(isArray(imports),`Property 'imports' of a static module record must be an array, got ${q(imports)}, for module ${q(moduleSpecifier)}`),assert(isArray(exports),`Property 'exports' of a precompiled module record must be an array, got ${q(exports)}, for module ${q(moduleSpecifier)}`),assert(isArray(reexports),`Property 'reexports' of a precompiled module record must be an array if present, got ${q(reexports)}, for module ${q(moduleSpecifier)}`)}(staticModuleRecord,moduleSpecifier);const importedInstances=new Map;let moduleInstance;if(function(staticModuleRecord){return"string"==typeof staticModuleRecord.__syncModuleProgram__}(staticModuleRecord))!function(staticModuleRecord,moduleSpecifier){const{__fixedExportMap__:__fixedExportMap__,__liveExportMap__:__liveExportMap__}=staticModuleRecord;assert(isObject(__fixedExportMap__),`Property '__fixedExportMap__' of a precompiled module record must be an object, got ${q(__fixedExportMap__)}, for module ${q(moduleSpecifier)}`),assert(isObject(__liveExportMap__),`Property '__liveExportMap__' of a precompiled module record must be an object, got ${q(__liveExportMap__)}, for module ${q(moduleSpecifier)}`)}(staticModuleRecord,moduleSpecifier),moduleInstance=makeModuleInstance(compartmentPrivateFields,moduleAliases,moduleRecord,importedInstances);else{if(!function(staticModuleRecord){return"function"==typeof staticModuleRecord.execute}(staticModuleRecord))throw new Error("importHook must return a static module record, got "+q(staticModuleRecord));!function(staticModuleRecord,moduleSpecifier){const{exports:exports}=staticModuleRecord;assert(isArray(exports),`Property 'exports' of a third-party static module record must be an array, got ${q(exports)}, for module ${q(moduleSpecifier)}`)}(staticModuleRecord,moduleSpecifier),moduleInstance=makeThirdPartyModuleInstance(compartmentPrivateFields,staticModuleRecord,compartment,moduleAliases,moduleSpecifier,resolvedImports)}mapSet(instances,moduleSpecifier,moduleInstance);for(const[importSpecifier,resolvedSpecifier]of entries(resolvedImports)){const importedInstance=link(compartmentPrivateFields,moduleAliases,compartment,resolvedSpecifier);mapSet(importedInstances,importSpecifier,importedInstance)}return moduleInstance};$h‍_once.instantiate(instantiate)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,Map,ReferenceError,TypeError,WeakMap,WeakSet,assign,create,defineProperties,entries,freeze,getOwnPropertyDescriptors,getOwnPropertyNames,weakmapGet,weakmapSet,weaksetHas,initGlobalObject,performEval,isValidIdentifierName,sharedGlobalPropertyNames,evadeHtmlCommentTest,evadeImportExpressionTest,rejectSomeDirectEvalExpressions,load,link,getDeferredExports,assert;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Map",[$h‍_a=>Map=$h‍_a]],["ReferenceError",[$h‍_a=>ReferenceError=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["WeakMap",[$h‍_a=>WeakMap=$h‍_a]],["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["assign",[$h‍_a=>assign=$h‍_a]],["create",[$h‍_a=>create=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]],["entries",[$h‍_a=>entries=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["getOwnPropertyDescriptors",[$h‍_a=>getOwnPropertyDescriptors=$h‍_a]],["getOwnPropertyNames",[$h‍_a=>getOwnPropertyNames=$h‍_a]],["weakmapGet",[$h‍_a=>weakmapGet=$h‍_a]],["weakmapSet",[$h‍_a=>weakmapSet=$h‍_a]],["weaksetHas",[$h‍_a=>weaksetHas=$h‍_a]]]],["./global-object.js",[["initGlobalObject",[$h‍_a=>initGlobalObject=$h‍_a]]]],["./evaluate.js",[["performEval",[$h‍_a=>performEval=$h‍_a]]]],["./scope-constants.js",[["isValidIdentifierName",[$h‍_a=>isValidIdentifierName=$h‍_a]]]],["./whitelist.js",[["sharedGlobalPropertyNames",[$h‍_a=>sharedGlobalPropertyNames=$h‍_a]]]],["./transforms.js",[["evadeHtmlCommentTest",[$h‍_a=>evadeHtmlCommentTest=$h‍_a]],["evadeImportExpressionTest",[$h‍_a=>evadeImportExpressionTest=$h‍_a]],["rejectSomeDirectEvalExpressions",[$h‍_a=>rejectSomeDirectEvalExpressions=$h‍_a]]]],["./module-load.js",[["load",[$h‍_a=>load=$h‍_a]]]],["./module-link.js",[["link",[$h‍_a=>link=$h‍_a]]]],["./module-proxy.js",[["getDeferredExports",[$h‍_a=>getDeferredExports=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);const{quote:q}=assert,moduleAliases=new WeakMap,privateFields=new WeakMap,assertModuleHooks=compartment=>{const{importHook:importHook,resolveHook:resolveHook}=weakmapGet(privateFields,compartment);if("function"!=typeof importHook||"function"!=typeof resolveHook)throw new TypeError("Compartment must be constructed with an importHook and a resolveHook for it to be able to load modules")},InertCompartment=function(_endowments={},_modules={},_options={}){throw new TypeError("Compartment.prototype.constructor is not a valid constructor.")};$h‍_once.InertCompartment(InertCompartment);const CompartmentPrototype={constructor:InertCompartment,get globalThis(){return weakmapGet(privateFields,this).globalObject},get name(){return weakmapGet(privateFields,this).name},evaluate(source,options={}){if("string"!=typeof source)throw new TypeError("first argument of evaluate() must be a string");const{transforms:transforms=[],sloppyGlobalsMode:sloppyGlobalsMode=!1,__moduleShimLexicals__:__moduleShimLexicals__,__evadeHtmlCommentTest__:__evadeHtmlCommentTest__=!1,__evadeImportExpressionTest__:__evadeImportExpressionTest__=!1,__rejectSomeDirectEvalExpressions__:__rejectSomeDirectEvalExpressions__=!0}=options,localTransforms=[...transforms];!0===__evadeHtmlCommentTest__&&localTransforms.push(evadeHtmlCommentTest),!0===__evadeImportExpressionTest__&&localTransforms.push(evadeImportExpressionTest),!0===__rejectSomeDirectEvalExpressions__&&localTransforms.push(rejectSomeDirectEvalExpressions);const compartmentFields=weakmapGet(privateFields,this);let{globalTransforms:globalTransforms}=compartmentFields;const{globalObject:globalObject,globalLexicals:globalLexicals,knownScopeProxies:knownScopeProxies}=compartmentFields;let localObject=globalLexicals;return void 0!==__moduleShimLexicals__&&(globalTransforms=void 0,localObject=create(null,getOwnPropertyDescriptors(globalLexicals)),defineProperties(localObject,getOwnPropertyDescriptors(__moduleShimLexicals__))),performEval(source,globalObject,localObject,{globalTransforms:globalTransforms,localTransforms:localTransforms,sloppyGlobalsMode:sloppyGlobalsMode,knownScopeProxies:knownScopeProxies})},toString:()=>"[object Compartment]",__isKnownScopeProxy__(value){const{knownScopeProxies:knownScopeProxies}=weakmapGet(privateFields,this);return weaksetHas(knownScopeProxies,value)},module(specifier){if("string"!=typeof specifier)throw new TypeError("first argument of module() must be a string");assertModuleHooks(this);const{exportsProxy:exportsProxy}=getDeferredExports(this,weakmapGet(privateFields,this),moduleAliases,specifier);return exportsProxy},async import(specifier){if("string"!=typeof specifier)throw new TypeError("first argument of import() must be a string");return assertModuleHooks(this),load(privateFields,moduleAliases,this,specifier).then(()=>({namespace:this.importNow(specifier)}))},async load(specifier){if("string"!=typeof specifier)throw new TypeError("first argument of load() must be a string");return assertModuleHooks(this),load(privateFields,moduleAliases,this,specifier)},importNow(specifier){if("string"!=typeof specifier)throw new TypeError("first argument of importNow() must be a string");assertModuleHooks(this);const moduleInstance=link(privateFields,moduleAliases,this,specifier);return moduleInstance.execute(),moduleInstance.exportsProxy}};$h‍_once.CompartmentPrototype(CompartmentPrototype),defineProperties(InertCompartment,{prototype:{value:CompartmentPrototype}});$h‍_once.makeCompartmentConstructor((targetMakeCompartmentConstructor,intrinsics,markVirtualizedNativeFunction)=>{function Compartment(endowments={},moduleMap={},options={}){if(void 0===new.target)throw new TypeError("Class constructor Compartment cannot be invoked without 'new'");const{name:name="<unknown>",transforms:transforms=[],__shimTransforms__:__shimTransforms__=[],globalLexicals:globalLexicals={},resolveHook:resolveHook,importHook:importHook,moduleMapHook:moduleMapHook}=options,globalTransforms=[...transforms,...__shimTransforms__],moduleRecords=new Map,instances=new Map,deferredExports=new Map;for(const[specifier,aliasNamespace]of entries(moduleMap||{})){if("string"==typeof aliasNamespace)throw new TypeError(`Cannot map module ${q(specifier)} to ${q(aliasNamespace)} in parent compartment`);if(void 0===weakmapGet(moduleAliases,aliasNamespace))throw ReferenceError(`Cannot map module ${q(specifier)} because it has no known compartment in this realm`)}const globalObject={};initGlobalObject(globalObject,intrinsics,sharedGlobalPropertyNames,targetMakeCompartmentConstructor,this.constructor.prototype,{globalTransforms:globalTransforms,markVirtualizedNativeFunction:markVirtualizedNativeFunction}),assign(globalObject,endowments);const invalidNames=getOwnPropertyNames(globalLexicals).filter(identifier=>!isValidIdentifierName(identifier));if(invalidNames.length)throw new Error(`Cannot create compartment with invalid names for global lexicals: ${invalidNames.join(", ")}; these names would not be lexically mentionable`);const knownScopeProxies=new WeakSet;weakmapSet(privateFields,this,{name:name,globalTransforms:globalTransforms,globalObject:globalObject,knownScopeProxies:knownScopeProxies,globalLexicals:freeze({...globalLexicals}),resolveHook:resolveHook,importHook:importHook,moduleMap:moduleMap,moduleMapHook:moduleMapHook,moduleRecords:moduleRecords,__shimTransforms__:__shimTransforms__,deferredExports:deferredExports,instances:instances})}return Compartment.prototype=CompartmentPrototype,Compartment})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Array,FERAL_FUNCTION,Float32Array,Map,RegExp,Set,String,getOwnPropertyDescriptor,getPrototypeOf,iteratorSymbol,matchAllSymbol,InertCompartment;function getConstructorOf(obj){return getPrototypeOf(obj).constructor}$h‍_imports([["./commons.js",[["Array",[$h‍_a=>Array=$h‍_a]],["FERAL_FUNCTION",[$h‍_a=>FERAL_FUNCTION=$h‍_a]],["Float32Array",[$h‍_a=>Float32Array=$h‍_a]],["Map",[$h‍_a=>Map=$h‍_a]],["RegExp",[$h‍_a=>RegExp=$h‍_a]],["Set",[$h‍_a=>Set=$h‍_a]],["String",[$h‍_a=>String=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["getPrototypeOf",[$h‍_a=>getPrototypeOf=$h‍_a]],["iteratorSymbol",[$h‍_a=>iteratorSymbol=$h‍_a]],["matchAllSymbol",[$h‍_a=>matchAllSymbol=$h‍_a]]]],["./compartment-shim.js",[["InertCompartment",[$h‍_a=>InertCompartment=$h‍_a]]]]]);$h‍_once.getAnonymousIntrinsics(()=>{const InertFunction=FERAL_FUNCTION.prototype.constructor,ThrowTypeError=getOwnPropertyDescriptor(function(){return arguments}(),"callee").get,StringIteratorObject=(new String)[iteratorSymbol](),StringIteratorPrototype=getPrototypeOf(StringIteratorObject),RegExpStringIterator=RegExp.prototype[matchAllSymbol]&&(new RegExp)[matchAllSymbol](),RegExpStringIteratorPrototype=RegExpStringIterator&&getPrototypeOf(RegExpStringIterator),ArrayIteratorObject=(new Array)[iteratorSymbol](),ArrayIteratorPrototype=getPrototypeOf(ArrayIteratorObject),TypedArray=getPrototypeOf(Float32Array),MapIteratorObject=(new Map)[iteratorSymbol](),MapIteratorPrototype=getPrototypeOf(MapIteratorObject),SetIteratorObject=(new Set)[iteratorSymbol](),SetIteratorPrototype=getPrototypeOf(SetIteratorObject),IteratorPrototype=getPrototypeOf(ArrayIteratorPrototype);const GeneratorFunction=getConstructorOf((function*(){})),Generator=GeneratorFunction.prototype;const AsyncGeneratorFunction=getConstructorOf((async function*(){})),AsyncGenerator=AsyncGeneratorFunction.prototype,AsyncGeneratorPrototype=AsyncGenerator.prototype,AsyncIteratorPrototype=getPrototypeOf(AsyncGeneratorPrototype);return{"%InertFunction%":InertFunction,"%ArrayIteratorPrototype%":ArrayIteratorPrototype,"%InertAsyncFunction%":getConstructorOf((async function(){})),"%AsyncGenerator%":AsyncGenerator,"%InertAsyncGeneratorFunction%":AsyncGeneratorFunction,"%AsyncGeneratorPrototype%":AsyncGeneratorPrototype,"%AsyncIteratorPrototype%":AsyncIteratorPrototype,"%Generator%":Generator,"%InertGeneratorFunction%":GeneratorFunction,"%IteratorPrototype%":IteratorPrototype,"%MapIteratorPrototype%":MapIteratorPrototype,"%RegExpStringIteratorPrototype%":RegExpStringIteratorPrototype,"%SetIteratorPrototype%":SetIteratorPrototype,"%StringIteratorPrototype%":StringIteratorPrototype,"%ThrowTypeError%":ThrowTypeError,"%TypedArray%":TypedArray,"%InertCompartment%":InertCompartment}})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let WeakSet,Error,Object,defineProperty,entries,freeze,getOwnPropertyDescriptor,getOwnPropertyDescriptors,globalThis,is,objectHasOwnProperty,values,arrayFilter,constantProperties,sharedGlobalPropertyNames,universalPropertyNames,whitelist;$h‍_imports([["./commons.js",[["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["Error",[$h‍_a=>Error=$h‍_a]],["Object",[$h‍_a=>Object=$h‍_a]],["defineProperty",[$h‍_a=>defineProperty=$h‍_a]],["entries",[$h‍_a=>entries=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["getOwnPropertyDescriptors",[$h‍_a=>getOwnPropertyDescriptors=$h‍_a]],["globalThis",[$h‍_a=>globalThis=$h‍_a]],["is",[$h‍_a=>is=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["values",[$h‍_a=>values=$h‍_a]],["arrayFilter",[$h‍_a=>arrayFilter=$h‍_a]]]],["./whitelist.js",[["constantProperties",[$h‍_a=>constantProperties=$h‍_a]],["sharedGlobalPropertyNames",[$h‍_a=>sharedGlobalPropertyNames=$h‍_a]],["universalPropertyNames",[$h‍_a=>universalPropertyNames=$h‍_a]],["whitelist",[$h‍_a=>whitelist=$h‍_a]]]]]);const isFunction=obj=>"function"==typeof obj;function initProperty(obj,name,desc){if(objectHasOwnProperty(obj,name)){const preDesc=getOwnPropertyDescriptor(obj,name);if(!is(preDesc.value,desc.value)||preDesc.get!==desc.get||preDesc.set!==desc.set||preDesc.writable!==desc.writable||preDesc.enumerable!==desc.enumerable||preDesc.configurable!==desc.configurable)throw new Error("Conflicting definitions of "+name)}defineProperty(obj,name,desc)}function sampleGlobals(globalObject,newPropertyNames){const newIntrinsics={__proto__:null};for(const[globalName,intrinsicName]of entries(newPropertyNames))objectHasOwnProperty(globalObject,globalName)&&(newIntrinsics[intrinsicName]=globalObject[globalName]);return newIntrinsics}const makeIntrinsicsCollector=()=>{const intrinsics={__proto__:null};let pseudoNatives;const intrinsicsCollector={addIntrinsics(newIntrinsics){!function(obj,descs){for(const[name,desc]of entries(descs))initProperty(obj,name,desc)}(intrinsics,getOwnPropertyDescriptors(newIntrinsics))},completePrototypes(){for(const[name,intrinsic]of entries(intrinsics)){if(intrinsic!==Object(intrinsic))continue;if(!objectHasOwnProperty(intrinsic,"prototype"))continue;const permit=whitelist[name];if("object"!=typeof permit)throw new Error("Expected permit object at whitelist."+name);const namePrototype=permit.prototype;if(!namePrototype)throw new Error(name+".prototype property not whitelisted");if("string"!=typeof namePrototype||!objectHasOwnProperty(whitelist,namePrototype))throw new Error(`Unrecognized ${name}.prototype whitelist entry`);const intrinsicPrototype=intrinsic.prototype;if(objectHasOwnProperty(intrinsics,namePrototype)){if(intrinsics[namePrototype]!==intrinsicPrototype)throw new Error("Conflicting bindings of "+namePrototype)}else intrinsics[namePrototype]=intrinsicPrototype}},finalIntrinsics:()=>(freeze(intrinsics),pseudoNatives=new WeakSet(arrayFilter(values(intrinsics),isFunction)),intrinsics),isPseudoNative(obj){if(!pseudoNatives)throw new Error("isPseudoNative can only be called after finalIntrinsics");return pseudoNatives.has(obj)}};return intrinsicsCollector.addIntrinsics(constantProperties),intrinsicsCollector.addIntrinsics(sampleGlobals(globalThis,universalPropertyNames)),intrinsicsCollector};$h‍_once.makeIntrinsicsCollector(makeIntrinsicsCollector);$h‍_once.getGlobalIntrinsics(globalObject=>{const intrinsicsCollector=makeIntrinsicsCollector();return intrinsicsCollector.addIntrinsics(sampleGlobals(globalObject,sharedGlobalPropertyNames)),intrinsicsCollector.finalIntrinsics()})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{$h‍_imports([]);$h‍_once.minEnablements({"%ObjectPrototype%":{toString:!0},"%FunctionPrototype%":{toString:!0},"%ErrorPrototype%":{name:!0}});const moderateEnablements={"%ObjectPrototype%":{toString:!0,valueOf:!0},"%ArrayPrototype%":{toString:!0,push:!0},"%FunctionPrototype%":{constructor:!0,bind:!0,toString:!0},"%ErrorPrototype%":{constructor:!0,message:!0,name:!0,toString:!0},"%TypeErrorPrototype%":{constructor:!0,message:!0,name:!0},"%SyntaxErrorPrototype%":{message:!0},"%RangeErrorPrototype%":{message:!0},"%URIErrorPrototype%":{message:!0},"%EvalErrorPrototype%":{message:!0},"%ReferenceErrorPrototype%":{message:!0},"%PromisePrototype%":{constructor:!0},"%TypedArrayPrototype%":"*","%Generator%":{constructor:!0,name:!0,toString:!0},"%IteratorPrototype%":{toString:!0}};$h‍_once.moderateEnablements(moderateEnablements);const severeEnablements={...moderateEnablements,"%ObjectPrototype%":"*","%TypedArrayPrototype%":"*"};$h‍_once.severeEnablements(severeEnablements)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,Set,String,TypeError,defineProperty,getOwnPropertyDescriptor,getOwnPropertyDescriptors,getOwnPropertyNames,isObject,objectHasOwnProperty,ownKeys,setHas,minEnablements,moderateEnablements,severeEnablements;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Set",[$h‍_a=>Set=$h‍_a]],["String",[$h‍_a=>String=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["defineProperty",[$h‍_a=>defineProperty=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["getOwnPropertyDescriptors",[$h‍_a=>getOwnPropertyDescriptors=$h‍_a]],["getOwnPropertyNames",[$h‍_a=>getOwnPropertyNames=$h‍_a]],["isObject",[$h‍_a=>isObject=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["ownKeys",[$h‍_a=>ownKeys=$h‍_a]],["setHas",[$h‍_a=>setHas=$h‍_a]]]],["./enablements.js",[["minEnablements",[$h‍_a=>minEnablements=$h‍_a]],["moderateEnablements",[$h‍_a=>moderateEnablements=$h‍_a]],["severeEnablements",[$h‍_a=>severeEnablements=$h‍_a]]]]]),$h‍_once.default((function(intrinsics,overrideTaming,overrideDebug=[]){const debugProperties=new Set(overrideDebug);function enable(path,obj,prop,desc){if("value"in desc&&desc.configurable){const{value:value}=desc;function getter(){return value}defineProperty(getter,"originalValue",{value:value,writable:!1,enumerable:!1,configurable:!1});const isDebug=setHas(debugProperties,prop);defineProperty(obj,prop,{get:getter,set:function(newValue){if(obj===this)throw new TypeError(`Cannot assign to read only property '${String(prop)}' of '${path}'`);objectHasOwnProperty(this,prop)?this[prop]=newValue:(isDebug&&console.error(new Error("Override property "+prop)),defineProperty(this,prop,{value:newValue,writable:!0,enumerable:!0,configurable:!0}))},enumerable:desc.enumerable,configurable:desc.configurable})}}function enableProperty(path,obj,prop){const desc=getOwnPropertyDescriptor(obj,prop);desc&&enable(path,obj,prop,desc)}function enableAllProperties(path,obj){const descs=getOwnPropertyDescriptors(obj);descs&&ownKeys(descs).forEach(prop=>enable(path,obj,prop,descs[prop]))}let plan;switch(overrideTaming){case"min":plan=minEnablements;break;case"moderate":plan=moderateEnablements;break;case"severe":plan=severeEnablements;break;default:throw new Error("unrecognized overrideTaming "+overrideTaming)}!function enableProperties(path,obj,plan){for(const prop of getOwnPropertyNames(plan)){const desc=getOwnPropertyDescriptor(obj,prop);if(!desc||desc.get||desc.set)continue;const subPath=`${path}.${String(prop)}`,subPlan=plan[prop];if(!0===subPlan)enableProperty(subPath,obj,prop);else if("*"===subPlan)enableAllProperties(subPath,desc.value);else{if(!isObject(subPlan))throw new TypeError("Unexpected override enablement plan "+subPath);enableProperties(subPath,desc.value,subPlan)}}}("root",intrinsics,plan)}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,WeakSet,defineProperty,freeze,fromEntries,weaksetAdd,weaksetHas;$h‍_imports([["../commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["defineProperty",[$h‍_a=>defineProperty=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["fromEntries",[$h‍_a=>fromEntries=$h‍_a]],["weaksetAdd",[$h‍_a=>weaksetAdd=$h‍_a]],["weaksetHas",[$h‍_a=>weaksetHas=$h‍_a]]]],["./types.js",[]],["./internal-types.js",[]]]);const consoleLevelMethods=freeze([["debug","debug"],["log","log"],["info","info"],["warn","warn"],["error","error"],["trace","log"],["dirxml","log"],["group","log"],["groupCollapsed","log"]]),consoleOtherMethods=freeze([["assert","error"],["timeLog","log"],["clear",void 0],["count","info"],["countReset",void 0],["dir","log"],["groupEnd","log"],["table","log"],["time","info"],["timeEnd","info"],["profile",void 0],["profileEnd",void 0],["timeStamp",void 0]]),consoleWhitelist=freeze([...consoleLevelMethods,...consoleOtherMethods]);$h‍_once.consoleWhitelist(consoleWhitelist);const makeLoggingConsoleKit=(loggedErrorHandler,{shouldResetForDebugging:shouldResetForDebugging=!1}={})=>{shouldResetForDebugging&&loggedErrorHandler.resetErrorTagNum();let logArray=[];const loggingConsole=fromEntries(consoleWhitelist.map(([name,_])=>{const method=(...args)=>{logArray.push([name,...args])};return defineProperty(method,"name",{value:name}),[name,freeze(method)]}));freeze(loggingConsole);const takeLog=()=>{const result=freeze(logArray);return logArray=[],result};freeze(takeLog);return freeze({loggingConsole:loggingConsole,takeLog:takeLog})};$h‍_once.makeLoggingConsoleKit(makeLoggingConsoleKit),freeze(makeLoggingConsoleKit);const ErrorInfo={NOTE:"ERROR_NOTE:",MESSAGE:"ERROR_MESSAGE:"};freeze(ErrorInfo);$h‍_once.BASE_CONSOLE_LEVEL("debug");const makeCausalConsole=(baseConsole,loggedErrorHandler)=>{const{getStackString:getStackString,tagError:tagError,takeMessageLogArgs:takeMessageLogArgs,takeNoteLogArgsArray:takeNoteLogArgsArray}=loggedErrorHandler,extractErrorArgs=(logArgs,subErrorsSink)=>logArgs.map(arg=>arg instanceof Error?(subErrorsSink.push(arg),`(${tagError(arg)})`):arg),logErrorInfo=(error,kind,logArgs,subErrorsSink)=>{const errorTag=tagError(error),errorName=kind===ErrorInfo.MESSAGE?errorTag+":":`${errorTag} ${kind}`,argTags=extractErrorArgs(logArgs,subErrorsSink);baseConsole.debug(errorName,...argTags)},logSubErrors=(subErrors,optTag)=>{if(0===subErrors.length)return;if(1===subErrors.length&&void 0===optTag)return void logError(subErrors[0]);let label;label=1===subErrors.length?"Nested error":`Nested ${subErrors.length} errors`,void 0!==optTag&&(label=`${label} under ${optTag}`),baseConsole.group(label);try{for(const subError of subErrors)logError(subError)}finally{baseConsole.groupEnd()}},errorsLogged=new WeakSet,noteCallback=(error,noteLogArgs)=>{const subErrors=[];logErrorInfo(error,ErrorInfo.NOTE,noteLogArgs,subErrors),logSubErrors(subErrors,tagError(error))},logError=error=>{if(weaksetHas(errorsLogged,error))return;const errorTag=tagError(error);weaksetAdd(errorsLogged,error);const subErrors=[],messageLogArgs=takeMessageLogArgs(error),noteLogArgsArray=takeNoteLogArgsArray(error,noteCallback);void 0===messageLogArgs?baseConsole.debug(errorTag+":",error.message):logErrorInfo(error,ErrorInfo.MESSAGE,messageLogArgs,subErrors);let stackString=getStackString(error);"string"==typeof stackString&&stackString.length>=1&&!stackString.endsWith("\n")&&(stackString+="\n"),baseConsole.debug(stackString);for(const noteLogArgs of noteLogArgsArray)logErrorInfo(error,ErrorInfo.NOTE,noteLogArgs,subErrors);logSubErrors(subErrors,errorTag)},levelMethods=consoleLevelMethods.map(([level,_])=>{const levelMethod=(...logArgs)=>{const subErrors=[],argTags=extractErrorArgs(logArgs,subErrors);baseConsole[level](...argTags),logSubErrors(subErrors)};return defineProperty(levelMethod,"name",{value:level}),[level,freeze(levelMethod)]}),otherMethods=consoleOtherMethods.filter(([name,_])=>name in baseConsole).map(([name,_])=>{const otherMethod=(...args)=>{baseConsole[name](...args)};return defineProperty(otherMethod,"name",{value:name}),[name,freeze(otherMethod)]}),causalConsole=fromEntries([...levelMethods,...otherMethods]);return freeze(causalConsole)};$h‍_once.makeCausalConsole(makeCausalConsole),freeze(makeCausalConsole);const filterConsole=(baseConsole,filter,_topic)=>{const methods=consoleWhitelist.filter(([name,_])=>name in baseConsole).map(([name,severity])=>[name,freeze((...args)=>{(void 0===severity||filter.canLog(severity))&&baseConsole[name](...args)})]),filteringConsole=fromEntries(methods);return freeze(filteringConsole)};$h‍_once.filterConsole(filterConsole),freeze(filterConsole)},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,globalThis,defaultHandler,makeCausalConsole;$h‍_imports([["../commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["globalThis",[$h‍_a=>globalThis=$h‍_a]]]],["./assert.js",[["loggedErrorHandler",[$h‍_a=>defaultHandler=$h‍_a]]]],["./console.js",[["makeCausalConsole",[$h‍_a=>makeCausalConsole=$h‍_a]]]],["./types.js",[]],["./internal-types.js",[]]]);const originalConsole=console;$h‍_once.tameConsole((consoleTaming="safe",errorTrapping="platform",optGetStackString)=>{if("safe"!==consoleTaming&&"unsafe"!==consoleTaming)throw new Error("unrecognized consoleTaming "+consoleTaming);if("unsafe"===consoleTaming)return{console:originalConsole};let loggedErrorHandler;loggedErrorHandler=void 0===optGetStackString?defaultHandler:{...defaultHandler,getStackString:optGetStackString};const causalConsole=makeCausalConsole(originalConsole,loggedErrorHandler);return"none"!==errorTrapping&&void 0!==globalThis.process&&globalThis.process.on("uncaughtException",error=>{causalConsole.error(error),"platform"===errorTrapping||"exit"===errorTrapping?globalThis.process.exit(globalThis.process.exitCode||-1):"abort"===errorTrapping&&globalThis.process.abort()}),"none"!==errorTrapping&&void 0!==globalThis.window&&globalThis.window.addEventListener("error",event=>{event.preventDefault();const stackString=loggedErrorHandler.getStackString(event.error);causalConsole.error(stackString),"exit"!==errorTrapping&&"abort"!==errorTrapping||(globalThis.window.location.href="about:blank")}),{console:causalConsole}})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let WeakMap,WeakSet,weaksetHas,weaksetAdd,weakmapSet,weakmapGet,weakmapHas,create,defineProperties,fromEntries,reflectSet;$h‍_imports([["../commons.js",[["WeakMap",[$h‍_a=>WeakMap=$h‍_a]],["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["weaksetHas",[$h‍_a=>weaksetHas=$h‍_a]],["weaksetAdd",[$h‍_a=>weaksetAdd=$h‍_a]],["weakmapSet",[$h‍_a=>weakmapSet=$h‍_a]],["weakmapGet",[$h‍_a=>weakmapGet=$h‍_a]],["weakmapHas",[$h‍_a=>weakmapHas=$h‍_a]],["create",[$h‍_a=>create=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]],["fromEntries",[$h‍_a=>fromEntries=$h‍_a]],["reflectSet",[$h‍_a=>reflectSet=$h‍_a]]]]]);const safeV8CallSiteMethodNames=["getTypeName","getFunctionName","getMethodName","getFileName","getLineNumber","getColumnNumber","getEvalOrigin","isToplevel","isEval","isNative","isConstructor","isAsync","getPosition","getScriptNameOrSourceURL","toString"],safeV8CallSiteFacet=callSite=>{const o=fromEntries(safeV8CallSiteMethodNames.map(name=>[name,()=>callSite[name]()]));return create(o,{})},FILENAME_CENSORS=[/\/node_modules\//,/^(?:node:)?internal\//,/\/packages\/ses\/src\/error\/assert.js$/,/\/packages\/eventual-send\/src\//],filterFileName=fileName=>{if(!fileName)return!0;for(const filter of FILENAME_CENSORS)if(filter.test(fileName))return!1;return!0};$h‍_once.filterFileName(filterFileName);const CALLSITE_PATTERNS=[/^((?:.*[( ])?)[:/\w_-]*\/\.\.\.\/(.+)$/,/^((?:.*[( ])?)[:/\w_-]*\/(packages\/.+)$/],shortenCallSiteString=callSiteString=>{for(const filter of CALLSITE_PATTERNS){const match=filter.exec(callSiteString);if(match)return match.slice(1).join("")}return callSiteString};$h‍_once.shortenCallSiteString(shortenCallSiteString);$h‍_once.tameV8ErrorConstructor((OriginalError,InitialError,errorTaming,stackFiltering)=>{const callSiteFilter=callSite=>"verbose"===stackFiltering||filterFileName(callSite.getFileName()),callSiteStringifier=callSite=>{let callSiteString=""+callSite;return"concise"===stackFiltering&&(callSiteString=shortenCallSiteString(callSiteString)),"\n  at "+callSiteString},stackStringFromSST=(_error,sst)=>[...sst.filter(callSiteFilter).map(callSiteStringifier)].join(""),ssts=new WeakMap,tamedMethods={captureStackTrace(error,optFn=tamedMethods.captureStackTrace){"function"!=typeof OriginalError.captureStackTrace?reflectSet(error,"stack",""):OriginalError.captureStackTrace(error,optFn)},getStackString(error){weakmapHas(ssts,error)||error.stack;const sst=weakmapGet(ssts,error);return sst?stackStringFromSST(0,sst):""},prepareStackTrace(error,sst){if(weakmapSet(ssts,error,sst),"unsafe"===errorTaming){return`${error}${stackStringFromSST(0,sst)}`}return""}},defaultPrepareFn=tamedMethods.prepareStackTrace;OriginalError.prepareStackTrace=defaultPrepareFn;const systemPrepareFnSet=new WeakSet([defaultPrepareFn]),systemPrepareFnFor=inputPrepareFn=>{if(weaksetHas(systemPrepareFnSet,inputPrepareFn))return inputPrepareFn;const systemMethods={prepareStackTrace:(error,sst)=>(weakmapSet(ssts,error,sst),inputPrepareFn(error,(sst=>sst.map(safeV8CallSiteFacet))(sst)))};return weaksetAdd(systemPrepareFnSet,systemMethods.prepareStackTrace),systemMethods.prepareStackTrace};return defineProperties(InitialError,{captureStackTrace:{value:tamedMethods.captureStackTrace,writable:!0,enumerable:!1,configurable:!0},prepareStackTrace:{get:()=>OriginalError.prepareStackTrace,set(inputPrepareStackTraceFn){if("function"==typeof inputPrepareStackTraceFn){const systemPrepareFn=systemPrepareFnFor(inputPrepareStackTraceFn);OriginalError.prepareStackTrace=systemPrepareFn}else OriginalError.prepareStackTrace=defaultPrepareFn},enumerable:!1,configurable:!0}}),tamedMethods.getStackString})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,apply,construct,defineProperties,setPrototypeOf,getOwnPropertyDescriptor,NativeErrors,tameV8ErrorConstructor;$h‍_imports([["../commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["apply",[$h‍_a=>apply=$h‍_a]],["construct",[$h‍_a=>construct=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]],["setPrototypeOf",[$h‍_a=>setPrototypeOf=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]]]],["../whitelist.js",[["NativeErrors",[$h‍_a=>NativeErrors=$h‍_a]]]],["./tame-v8-error-constructor.js",[["tameV8ErrorConstructor",[$h‍_a=>tameV8ErrorConstructor=$h‍_a]]]]]);const stackDesc=getOwnPropertyDescriptor(Error.prototype,"stack"),stackGetter=stackDesc&&stackDesc.get,tamedMethods={getStackString:error=>"function"==typeof stackGetter?apply(stackGetter,error,[]):"stack"in error?""+error.stack:""};$h‍_once.default((function(errorTaming="safe",stackFiltering="concise"){if("safe"!==errorTaming&&"unsafe"!==errorTaming)throw new Error("unrecognized errorTaming "+errorTaming);if("concise"!==stackFiltering&&"verbose"!==stackFiltering)throw new Error("unrecognized stackFiltering "+stackFiltering);const OriginalError=Error,ErrorPrototype=OriginalError.prototype,platform="function"==typeof OriginalError.captureStackTrace?"v8":"unknown",makeErrorConstructor=(_={})=>{const ResultError=function(...rest){let error;return error=void 0===new.target?apply(OriginalError,this,rest):construct(OriginalError,rest,new.target),"v8"===platform&&OriginalError.captureStackTrace(error,ResultError),error};return defineProperties(ResultError,{length:{value:1},prototype:{value:ErrorPrototype,writable:!1,enumerable:!1,configurable:!1}}),ResultError},InitialError=makeErrorConstructor({powers:"original"}),SharedError=makeErrorConstructor({powers:"none"});defineProperties(ErrorPrototype,{constructor:{value:SharedError}});for(const NativeError of NativeErrors)setPrototypeOf(NativeError,SharedError);defineProperties(InitialError,{stackTraceLimit:{get(){if("number"==typeof OriginalError.stackTraceLimit)return OriginalError.stackTraceLimit},set(newLimit){"number"==typeof newLimit&&("number"!=typeof OriginalError.stackTraceLimit||(OriginalError.stackTraceLimit=newLimit))},enumerable:!1,configurable:!0}}),defineProperties(SharedError,{stackTraceLimit:{get(){},set(_newLimit){},enumerable:!1,configurable:!0}});let initialGetStackString=tamedMethods.getStackString;return"v8"===platform&&(initialGetStackString=tameV8ErrorConstructor(OriginalError,InitialError,errorTaming,stackFiltering)),{"%InitialGetStackString%":initialGetStackString,"%InitialError%":InitialError,"%SharedError%":SharedError}}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Set,String,TypeError,WeakMap,WeakSet,arrayForEach,freeze,getOwnPropertyDescriptors,getPrototypeOf,isObject,objectHasOwnProperty,ownKeys,setAdd,setForEach,setHas,weakmapGet,weakmapSet,weaksetAdd,weaksetHas;$h‍_imports([["./commons.js",[["Set",[$h‍_a=>Set=$h‍_a]],["String",[$h‍_a=>String=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["WeakMap",[$h‍_a=>WeakMap=$h‍_a]],["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["arrayForEach",[$h‍_a=>arrayForEach=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["getOwnPropertyDescriptors",[$h‍_a=>getOwnPropertyDescriptors=$h‍_a]],["getPrototypeOf",[$h‍_a=>getPrototypeOf=$h‍_a]],["isObject",[$h‍_a=>isObject=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["ownKeys",[$h‍_a=>ownKeys=$h‍_a]],["setAdd",[$h‍_a=>setAdd=$h‍_a]],["setForEach",[$h‍_a=>setForEach=$h‍_a]],["setHas",[$h‍_a=>setHas=$h‍_a]],["weakmapGet",[$h‍_a=>weakmapGet=$h‍_a]],["weakmapSet",[$h‍_a=>weakmapSet=$h‍_a]],["weaksetAdd",[$h‍_a=>weaksetAdd=$h‍_a]],["weaksetHas",[$h‍_a=>weaksetHas=$h‍_a]]]]]);$h‍_once.makeHardener(()=>{const hardened=new WeakSet,{harden:harden}={harden(root){const toFreeze=new Set,paths=new WeakMap;function enqueue(val,path){if(!isObject(val))return;const type=typeof val;if("object"!==type&&"function"!==type)throw new TypeError("Unexpected typeof: "+type);weaksetHas(hardened,val)||setHas(toFreeze,val)||(setAdd(toFreeze,val),weakmapSet(paths,val,path))}function freezeAndTraverse(obj){freeze(obj);const path=weakmapGet(paths,obj)||"unknown",descs=getOwnPropertyDescriptors(obj);enqueue(getPrototypeOf(obj),path+".__proto__"),arrayForEach(ownKeys(descs),name=>{const pathname=`${path}.${String(name)}`,desc=descs[name];objectHasOwnProperty(desc,"value")?enqueue(desc.value,""+pathname):(enqueue(desc.get,pathname+"(get)"),enqueue(desc.set,pathname+"(set)"))})}function markHardened(value){weaksetAdd(hardened,value)}return enqueue(root),setForEach(toFreeze,freezeAndTraverse),setForEach(toFreeze,markHardened),root}};return harden})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,Date,apply,construct,defineProperties;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Date",[$h‍_a=>Date=$h‍_a]],["apply",[$h‍_a=>apply=$h‍_a]],["construct",[$h‍_a=>construct=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]]]]]),$h‍_once.default((function(dateTaming="safe"){if("safe"!==dateTaming&&"unsafe"!==dateTaming)throw new Error("unrecognized dateTaming "+dateTaming);const OriginalDate=Date,DatePrototype=OriginalDate.prototype,tamedMethods={now:()=>NaN},makeDateConstructor=({powers:powers="none"}={})=>{let ResultDate;return ResultDate="original"===powers?function(...rest){return void 0===new.target?apply(OriginalDate,void 0,rest):construct(OriginalDate,rest,new.target)}:function(...rest){return void 0===new.target?"Invalid Date":(0===rest.length&&(rest=[NaN]),construct(OriginalDate,rest,new.target))},defineProperties(ResultDate,{length:{value:7},prototype:{value:DatePrototype,writable:!1,enumerable:!1,configurable:!1},parse:{value:Date.parse,writable:!0,enumerable:!1,configurable:!0},UTC:{value:Date.UTC,writable:!0,enumerable:!1,configurable:!0}}),ResultDate},InitialDate=makeDateConstructor({powers:"original"}),SharedDate=makeDateConstructor({powers:"none"});return defineProperties(InitialDate,{now:{value:Date.now,writable:!0,enumerable:!1,configurable:!0}}),defineProperties(SharedDate,{now:{value:tamedMethods.now,writable:!0,enumerable:!1,configurable:!0}}),defineProperties(DatePrototype,{constructor:{value:SharedDate}}),{"%InitialDate%":InitialDate,"%SharedDate%":SharedDate}}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let FERAL_FUNCTION,SyntaxError,TypeError,defineProperties,getPrototypeOf,setPrototypeOf;$h‍_imports([["./commons.js",[["FERAL_FUNCTION",[$h‍_a=>FERAL_FUNCTION=$h‍_a]],["SyntaxError",[$h‍_a=>SyntaxError=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]],["getPrototypeOf",[$h‍_a=>getPrototypeOf=$h‍_a]],["setPrototypeOf",[$h‍_a=>setPrototypeOf=$h‍_a]]]]]),$h‍_once.default((function(){try{FERAL_FUNCTION.prototype.constructor("return 1")}catch(ignore){return{}}const newIntrinsics={};function repairFunction(name,intrinsicName,declaration){let FunctionInstance;try{FunctionInstance=(0,eval)(declaration)}catch(e){if(e instanceof SyntaxError)return;throw e}const FunctionPrototype=getPrototypeOf(FunctionInstance),InertConstructor=function(){throw new TypeError("Function.prototype.constructor is not a valid constructor.")};defineProperties(InertConstructor,{prototype:{value:FunctionPrototype},name:{value:name,writable:!1,enumerable:!1,configurable:!0}}),defineProperties(FunctionPrototype,{constructor:{value:InertConstructor}}),InertConstructor!==FERAL_FUNCTION.prototype.constructor&&setPrototypeOf(InertConstructor,FERAL_FUNCTION.prototype.constructor),newIntrinsics[intrinsicName]=InertConstructor}return repairFunction("Function","%InertFunction%","(function(){})"),repairFunction("GeneratorFunction","%InertGeneratorFunction%","(function*(){})"),repairFunction("AsyncFunction","%InertAsyncFunction%","(async function(){})"),repairFunction("AsyncGeneratorFunction","%InertAsyncGeneratorFunction%","(async function*(){})"),newIntrinsics}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let WeakSet,defineProperty,freeze,functionPrototype,functionToString,stringEndsWith,weaksetAdd,weaksetHas;$h‍_imports([["./commons.js",[["WeakSet",[$h‍_a=>WeakSet=$h‍_a]],["defineProperty",[$h‍_a=>defineProperty=$h‍_a]],["freeze",[$h‍_a=>freeze=$h‍_a]],["functionPrototype",[$h‍_a=>functionPrototype=$h‍_a]],["functionToString",[$h‍_a=>functionToString=$h‍_a]],["stringEndsWith",[$h‍_a=>stringEndsWith=$h‍_a]],["weaksetAdd",[$h‍_a=>weaksetAdd=$h‍_a]],["weaksetHas",[$h‍_a=>weaksetHas=$h‍_a]]]]]);let markVirtualizedNativeFunction;$h‍_once.tameFunctionToString(()=>{if(void 0===markVirtualizedNativeFunction){const virtualizedNativeFunctions=new WeakSet;defineProperty(functionPrototype,"toString",{value:{toString(){const str=functionToString(this,[]);return stringEndsWith(str,") { [native code] }")||!weaksetHas(virtualizedNativeFunctions,this)?str:`function ${this.name}() { [native code] }`}}.toString}),markVirtualizedNativeFunction=freeze(func=>weaksetAdd(virtualizedNativeFunctions,func))}return markVirtualizedNativeFunction})},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,Object,String,TypeError,getOwnPropertyNames,defineProperty,assert;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Object",[$h‍_a=>Object=$h‍_a]],["String",[$h‍_a=>String=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["getOwnPropertyNames",[$h‍_a=>getOwnPropertyNames=$h‍_a]],["defineProperty",[$h‍_a=>defineProperty=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]);const{details:d,quote:q}=assert,localePattern=/^(\w*[a-z])Locale([A-Z]\w*)$/,nonLocaleCompare={localeCompare(that){if(null==this)throw new TypeError('Cannot localeCompare with null or undefined "this" value');const s=""+this;return s<(that=""+that)?-1:s>that?1:(assert(s===that,d`expected ${q(s)} and ${q(that)} to compare`),0)}}.localeCompare;$h‍_once.default((function(intrinsics,localeTaming="safe"){if("safe"!==localeTaming&&"unsafe"!==localeTaming)throw new Error("unrecognized dateTaming "+localeTaming);if("unsafe"!==localeTaming){defineProperty(String.prototype,"localeCompare",{value:nonLocaleCompare});for(const intrinsicName of getOwnPropertyNames(intrinsics)){const intrinsic=intrinsics[intrinsicName];if(intrinsic===Object(intrinsic))for(const methodName of getOwnPropertyNames(intrinsic)){const match=localePattern.exec(methodName);if(match){assert("function"==typeof intrinsic[methodName],d`expected ${q(methodName)} to be a function`);const nonLocaleMethodName=`${match[1]}${match[2]}`,method=intrinsic[nonLocaleMethodName];assert("function"==typeof method,d`function ${q(nonLocaleMethodName)} not found`),defineProperty(intrinsic,methodName,{value:method})}}}}}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,Math,create,getOwnPropertyDescriptors,objectPrototype;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["Math",[$h‍_a=>Math=$h‍_a]],["create",[$h‍_a=>create=$h‍_a]],["getOwnPropertyDescriptors",[$h‍_a=>getOwnPropertyDescriptors=$h‍_a]],["objectPrototype",[$h‍_a=>objectPrototype=$h‍_a]]]]]),$h‍_once.default((function(mathTaming="safe"){if("safe"!==mathTaming&&"unsafe"!==mathTaming)throw new Error("unrecognized mathTaming "+mathTaming);const originalMath=Math,initialMath=originalMath,{random:_,...otherDescriptors}=getOwnPropertyDescriptors(originalMath);return{"%InitialMath%":initialMath,"%SharedMath%":create(objectPrototype,otherDescriptors)}}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let Error,OriginalRegExp,construct,defineProperties,getOwnPropertyDescriptor,speciesSymbol;$h‍_imports([["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["RegExp",[$h‍_a=>OriginalRegExp=$h‍_a]],["construct",[$h‍_a=>construct=$h‍_a]],["defineProperties",[$h‍_a=>defineProperties=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["speciesSymbol",[$h‍_a=>speciesSymbol=$h‍_a]]]]]),$h‍_once.default((function(regExpTaming="safe"){if("safe"!==regExpTaming&&"unsafe"!==regExpTaming)throw new Error("unrecognized regExpTaming "+regExpTaming);const RegExpPrototype=OriginalRegExp.prototype,makeRegExpConstructor=(_={})=>{const ResultRegExp=function(...rest){return void 0===new.target?OriginalRegExp(...rest):construct(OriginalRegExp,rest,new.target)};return defineProperties(ResultRegExp,{length:{value:2},prototype:{value:RegExpPrototype,writable:!1,enumerable:!1,configurable:!1},[speciesSymbol]:getOwnPropertyDescriptor(OriginalRegExp,speciesSymbol)}),ResultRegExp},InitialRegExp=makeRegExpConstructor(),SharedRegExp=makeRegExpConstructor();return"unsafe"!==regExpTaming&&delete RegExpPrototype.compile,defineProperties(RegExpPrototype,{constructor:{value:SharedRegExp}}),{"%InitialRegExp%":InitialRegExp,"%SharedRegExp%":SharedRegExp}}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let whitelist,FunctionInstance,isAccessorPermit,Error,TypeError,arrayIncludes,getOwnPropertyDescriptor,getPrototypeOf,isObject,objectHasOwnProperty,ownKeys;function asStringPropertyName(path,prop){if("string"==typeof prop)return prop;if("symbol"==typeof prop)return"@@"+prop.toString().slice(14,-1);throw new TypeError(`Unexpected property name type ${path} ${prop}`)}$h‍_imports([["./whitelist.js",[["whitelist",[$h‍_a=>whitelist=$h‍_a]],["FunctionInstance",[$h‍_a=>FunctionInstance=$h‍_a]],["isAccessorPermit",[$h‍_a=>isAccessorPermit=$h‍_a]]]],["./commons.js",[["Error",[$h‍_a=>Error=$h‍_a]],["TypeError",[$h‍_a=>TypeError=$h‍_a]],["arrayIncludes",[$h‍_a=>arrayIncludes=$h‍_a]],["getOwnPropertyDescriptor",[$h‍_a=>getOwnPropertyDescriptor=$h‍_a]],["getPrototypeOf",[$h‍_a=>getPrototypeOf=$h‍_a]],["isObject",[$h‍_a=>isObject=$h‍_a]],["objectHasOwnProperty",[$h‍_a=>objectHasOwnProperty=$h‍_a]],["ownKeys",[$h‍_a=>ownKeys=$h‍_a]]]]]),$h‍_once.default((function(intrinsics,markVirtualizedNativeFunction){const primitives=["undefined","boolean","number","string","symbol"];function isAllowedPropertyValue(path,value,prop,permit){if("object"==typeof permit)return visitProperties(path,value,permit),!0;if(!1===permit)return!1;if("string"==typeof permit)if("prototype"===prop||"constructor"===prop){if(objectHasOwnProperty(intrinsics,permit)){if(value!==intrinsics[permit])throw new TypeError("Does not match whitelist "+path);return!0}}else if(arrayIncludes(primitives,permit)){if(typeof value!==permit)throw new TypeError(`At ${path} expected ${permit} not ${typeof value}`);return!0}throw new TypeError(`Unexpected whitelist permit ${permit} at ${path}`)}function isAllowedProperty(path,obj,prop,permit){const desc=getOwnPropertyDescriptor(obj,prop);if(objectHasOwnProperty(desc,"value")){if(isAccessorPermit(permit))throw new TypeError("Accessor expected at "+path);return isAllowedPropertyValue(path,desc.value,prop,permit)}if(!isAccessorPermit(permit))throw new TypeError("Accessor not expected at "+path);return isAllowedPropertyValue(path+"<get>",desc.get,prop,permit.get)&&isAllowedPropertyValue(path+"<set>",desc.set,prop,permit.set)}function getSubPermit(obj,permit,prop){const permitProp="__proto__"===prop?"--proto--":prop;return objectHasOwnProperty(permit,permitProp)?permit[permitProp]:"function"==typeof obj&&(markVirtualizedNativeFunction(obj),objectHasOwnProperty(FunctionInstance,permitProp))?FunctionInstance[permitProp]:void 0}function visitProperties(path,obj,permit){if(void 0===obj)return;!function(path,obj,protoName){if(!isObject(obj))throw new TypeError(`Object expected: ${path}, ${obj}, ${protoName}`);const proto=getPrototypeOf(obj);if(null!==proto||null!==protoName){if(void 0!==protoName&&"string"!=typeof protoName)throw new TypeError(`Malformed whitelist permit ${path}.__proto__`);if(proto!==intrinsics[protoName||"%ObjectPrototype%"])throw new Error(`Unexpected intrinsic ${path}.__proto__ at ${protoName}`)}}(path,obj,permit["[[Proto]]"]);for(const prop of ownKeys(obj)){const propString=asStringPropertyName(path,prop),subPath=`${path}.${propString}`,subPermit=getSubPermit(obj,permit,propString);if(!subPermit||!isAllowedProperty(subPath,obj,prop,subPermit)){!1!==subPermit&&console.log("Removing "+subPath);try{delete obj[prop]}catch(err){throw prop in obj?console.error("failed to delete "+subPath,err):console.error(`deleting ${subPath} threw`,err),err}}}}visitProperties("intrinsics",intrinsics,whitelist)}))},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let globalThis,is,keys,ownKeys,makeHardener,makeIntrinsicsCollector,whitelistIntrinsics,tameFunctionConstructors,tameDateConstructor,tameMathObject,tameRegExpConstructor,enablePropertyOverrides,tameLocaleMethods,initGlobalObject,initialGlobalPropertyNames,tameFunctionToString,tameConsole,tameErrorConstructor,assert,makeAssert;$h‍_imports([["./commons.js",[["globalThis",[$h‍_a=>globalThis=$h‍_a]],["is",[$h‍_a=>is=$h‍_a]],["keys",[$h‍_a=>keys=$h‍_a]],["ownKeys",[$h‍_a=>ownKeys=$h‍_a]]]],["./make-hardener.js",[["makeHardener",[$h‍_a=>makeHardener=$h‍_a]]]],["./intrinsics.js",[["makeIntrinsicsCollector",[$h‍_a=>makeIntrinsicsCollector=$h‍_a]]]],["./whitelist-intrinsics.js",[["default",[$h‍_a=>whitelistIntrinsics=$h‍_a]]]],["./tame-function-constructors.js",[["default",[$h‍_a=>tameFunctionConstructors=$h‍_a]]]],["./tame-date-constructor.js",[["default",[$h‍_a=>tameDateConstructor=$h‍_a]]]],["./tame-math-object.js",[["default",[$h‍_a=>tameMathObject=$h‍_a]]]],["./tame-regexp-constructor.js",[["default",[$h‍_a=>tameRegExpConstructor=$h‍_a]]]],["./enable-property-overrides.js",[["default",[$h‍_a=>enablePropertyOverrides=$h‍_a]]]],["./tame-locale-methods.js",[["default",[$h‍_a=>tameLocaleMethods=$h‍_a]]]],["./global-object.js",[["initGlobalObject",[$h‍_a=>initGlobalObject=$h‍_a]]]],["./whitelist.js",[["initialGlobalPropertyNames",[$h‍_a=>initialGlobalPropertyNames=$h‍_a]]]],["./tame-function-tostring.js",[["tameFunctionToString",[$h‍_a=>tameFunctionToString=$h‍_a]]]],["./error/tame-console.js",[["tameConsole",[$h‍_a=>tameConsole=$h‍_a]]]],["./error/tame-error-constructor.js",[["default",[$h‍_a=>tameErrorConstructor=$h‍_a]]]],["./error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]],["makeAssert",[$h‍_a=>makeAssert=$h‍_a]]]]]);const{details:d,quote:q}=assert;let firstOptions;const harden=makeHardener(),alreadyHardenedIntrinsics=()=>!1,repairIntrinsics=(makeCompartmentConstructor,compartmentPrototype,getAnonymousIntrinsics,options={})=>{options={...firstOptions,...options};const{dateTaming:dateTaming="safe",errorTaming:errorTaming="safe",mathTaming:mathTaming="safe",errorTrapping:errorTrapping="platform",regExpTaming:regExpTaming="safe",localeTaming:localeTaming="safe",consoleTaming:consoleTaming="safe",overrideTaming:overrideTaming="moderate",overrideDebug:overrideDebug=[],stackFiltering:stackFiltering="concise",__allowUnsafeMonkeyPatching__:__allowUnsafeMonkeyPatching__="safe",...extraOptions}=options,extraOptionsNames=ownKeys(extraOptions);if(assert(0===extraOptionsNames.length,d`lockdown(): non supported option ${q(extraOptionsNames)}`),firstOptions){for(const name of keys(firstOptions))assert(options[name]===firstOptions[name],d`lockdown(): cannot re-invoke with different option ${q(name)}`);return alreadyHardenedIntrinsics}firstOptions={dateTaming:dateTaming,errorTaming:errorTaming,mathTaming:mathTaming,regExpTaming:regExpTaming,localeTaming:localeTaming,consoleTaming:consoleTaming,overrideTaming:overrideTaming,overrideDebug:overrideDebug,stackFiltering:stackFiltering,__allowUnsafeMonkeyPatching__:__allowUnsafeMonkeyPatching__};if(globalThis.Function.prototype.constructor!==globalThis.Function&&"function"==typeof globalThis.harden&&"function"==typeof globalThis.lockdown&&globalThis.Date.prototype.constructor!==globalThis.Date&&"function"==typeof globalThis.Date.now&&is(globalThis.Date.prototype.constructor.now(),NaN))return console.log("Seems to already be locked down. Skipping second lockdown"),alreadyHardenedIntrinsics;const intrinsicsCollector=makeIntrinsicsCollector();intrinsicsCollector.addIntrinsics({harden:harden}),intrinsicsCollector.addIntrinsics(tameFunctionConstructors()),intrinsicsCollector.addIntrinsics(tameDateConstructor(dateTaming)),intrinsicsCollector.addIntrinsics(tameErrorConstructor(errorTaming,stackFiltering)),intrinsicsCollector.addIntrinsics(tameMathObject(mathTaming)),intrinsicsCollector.addIntrinsics(tameRegExpConstructor(regExpTaming)),intrinsicsCollector.addIntrinsics(getAnonymousIntrinsics()),intrinsicsCollector.completePrototypes();const intrinsics=intrinsicsCollector.finalIntrinsics();let optGetStackString;"unsafe"!==errorTaming&&(optGetStackString=intrinsics["%InitialGetStackString%"]);const consoleRecord=tameConsole(consoleTaming,errorTrapping,optGetStackString);globalThis.console=consoleRecord.console,"unsafe"===errorTaming&&globalThis.assert===assert&&(globalThis.assert=makeAssert(void 0,!0)),tameLocaleMethods(intrinsics,localeTaming);const markVirtualizedNativeFunction=tameFunctionToString();return whitelistIntrinsics(intrinsics,markVirtualizedNativeFunction),initGlobalObject(globalThis,intrinsics,initialGlobalPropertyNames,makeCompartmentConstructor,compartmentPrototype,{markVirtualizedNativeFunction:markVirtualizedNativeFunction}),function(){return enablePropertyOverrides(intrinsics,overrideTaming,overrideDebug),"unsafe"!==__allowUnsafeMonkeyPatching__&&harden(intrinsics),globalThis.harden=harden,!0}};$h‍_once.repairIntrinsics(repairIntrinsics);$h‍_once.makeLockdown((makeCompartmentConstructor,compartmentPrototype,getAnonymousIntrinsics)=>(options={})=>repairIntrinsics(makeCompartmentConstructor,compartmentPrototype,getAnonymousIntrinsics,options)())},({imports:$h‍_imports,liveVar:$h‍_live,onceVar:$h‍_once})=>{let globalThis,Error,assign,tameFunctionToString,getGlobalIntrinsics,getAnonymousIntrinsics,makeLockdown,makeCompartmentConstructor,CompartmentPrototype,assert;if($h‍_imports([["./src/commons.js",[["globalThis",[$h‍_a=>globalThis=$h‍_a]],["Error",[$h‍_a=>Error=$h‍_a]],["assign",[$h‍_a=>assign=$h‍_a]]]],["./src/tame-function-tostring.js",[["tameFunctionToString",[$h‍_a=>tameFunctionToString=$h‍_a]]]],["./src/intrinsics.js",[["getGlobalIntrinsics",[$h‍_a=>getGlobalIntrinsics=$h‍_a]]]],["./src/get-anonymous-intrinsics.js",[["getAnonymousIntrinsics",[$h‍_a=>getAnonymousIntrinsics=$h‍_a]]]],["./src/lockdown-shim.js",[["makeLockdown",[$h‍_a=>makeLockdown=$h‍_a]]]],["./src/compartment-shim.js",[["makeCompartmentConstructor",[$h‍_a=>makeCompartmentConstructor=$h‍_a]],["CompartmentPrototype",[$h‍_a=>CompartmentPrototype=$h‍_a]]]],["./src/error/assert.js",[["assert",[$h‍_a=>assert=$h‍_a]]]]]),function(){return this}())throw new Error("SES failed to initialize, sloppy mode (SES_NO_SLOPPY)");const markVirtualizedNativeFunction=tameFunctionToString(),Compartment=makeCompartmentConstructor(makeCompartmentConstructor,getGlobalIntrinsics(globalThis),markVirtualizedNativeFunction);assign(globalThis,{lockdown:makeLockdown(makeCompartmentConstructor,CompartmentPrototype,getAnonymousIntrinsics),Compartment:Compartment,assert:assert})}]);

/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PathMapper": () => (/* reexport safe */ _paths_js__WEBPACK_IMPORTED_MODULE_6__.PathMapper),
/* harmony export */   "Paths": () => (/* reexport safe */ _paths_js__WEBPACK_IMPORTED_MODULE_6__.Paths),
/* harmony export */   "arand": () => (/* reexport safe */ _rand_js__WEBPACK_IMPORTED_MODULE_7__.arand),
/* harmony export */   "async": () => (/* reexport safe */ _task_js__WEBPACK_IMPORTED_MODULE_8__.async),
/* harmony export */   "asyncTask": () => (/* reexport safe */ _task_js__WEBPACK_IMPORTED_MODULE_8__.asyncTask),
/* harmony export */   "computeAgeString": () => (/* reexport safe */ _date_js__WEBPACK_IMPORTED_MODULE_0__.computeAgeString),
/* harmony export */   "debounce": () => (/* reexport safe */ _task_js__WEBPACK_IMPORTED_MODULE_8__.debounce),
/* harmony export */   "deepCopy": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_5__.deepCopy),
/* harmony export */   "deepEqual": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_5__.deepEqual),
/* harmony export */   "deepUndefinedToNull": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_5__.deepUndefinedToNull),
/* harmony export */   "irand": () => (/* reexport safe */ _rand_js__WEBPACK_IMPORTED_MODULE_7__.irand),
/* harmony export */   "kebabToCaps": () => (/* reexport safe */ _names_js__WEBPACK_IMPORTED_MODULE_4__.kebabToCaps),
/* harmony export */   "key": () => (/* reexport safe */ _rand_js__WEBPACK_IMPORTED_MODULE_7__.key),
/* harmony export */   "logFactory": () => (/* reexport safe */ _log_js__WEBPACK_IMPORTED_MODULE_2__.logFactory),
/* harmony export */   "makeCapName": () => (/* reexport safe */ _names_js__WEBPACK_IMPORTED_MODULE_4__.makeCapName),
/* harmony export */   "makeId": () => (/* reexport safe */ _id_js__WEBPACK_IMPORTED_MODULE_1__.makeId),
/* harmony export */   "makeName": () => (/* reexport safe */ _names_js__WEBPACK_IMPORTED_MODULE_4__.makeName),
/* harmony export */   "matches": () => (/* reexport safe */ _matching_js__WEBPACK_IMPORTED_MODULE_3__.matches),
/* harmony export */   "prob": () => (/* reexport safe */ _rand_js__WEBPACK_IMPORTED_MODULE_7__.prob),
/* harmony export */   "shallowMerge": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_5__.shallowMerge),
/* harmony export */   "shallowUpdate": () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_5__.shallowUpdate)
/* harmony export */ });
/* harmony import */ var _date_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(26);
/* harmony import */ var _id_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _matching_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(17);
/* harmony import */ var _names_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(27);
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9);
/* harmony import */ var _paths_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(22);
/* harmony import */ var _rand_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(10);
/* harmony import */ var _task_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(28);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */






//export * from './params.js';





/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computeAgeString": () => (/* binding */ computeAgeString)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const computeAgeString = (date, now) => {
    let deltaTime = Math.round((now - date) / 1000);
    if (isNaN(deltaTime)) {
        return `•`;
    }
    let plural = '';
    if (deltaTime < 60) {
        if (deltaTime > 1)
            plural = 's';
        return `${deltaTime} second${plural} ago`;
    }
    deltaTime = Math.round(deltaTime / 60);
    if (deltaTime < 60) {
        if (deltaTime > 1)
            plural = 's';
        return `${deltaTime} minute${plural} ago`;
    }
    deltaTime = Math.round(deltaTime / 60);
    if (deltaTime < 24) {
        if (deltaTime > 1)
            plural = 's';
        return `${deltaTime} hour${plural} ago`;
    }
    deltaTime = Math.round(deltaTime / 24);
    if (deltaTime < 30) {
        if (deltaTime > 1)
            plural = 's';
        return `${deltaTime} day${plural} ago`;
    }
    deltaTime = Math.round(deltaTime / 30);
    if (deltaTime < 12) {
        if (deltaTime > 1)
            plural = 's';
        return `${deltaTime} month${plural} ago`;
    }
    deltaTime = Math.round(deltaTime / 12);
    if (deltaTime > 1)
        plural = 's';
    return `${deltaTime} year${plural} ago`;
};


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "kebabToCaps": () => (/* binding */ kebabToCaps),
/* harmony export */   "makeCapName": () => (/* binding */ makeCapName),
/* harmony export */   "makeName": () => (/* binding */ makeName)
/* harmony export */ });
/* harmony import */ var _rand_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const makeName = (delim) => {
    return `${(0,_rand_js__WEBPACK_IMPORTED_MODULE_0__.arand)(name1)}${delim || '-'}${(0,_rand_js__WEBPACK_IMPORTED_MODULE_0__.arand)(name2)}`;
};
const makeCapName = () => {
    return kebabToCaps(makeName());
};
const kebabToCaps = s => {
    const neo = [];
    for (let i = 0, c; (c = s[i]); i++) {
        neo.push((i > 0) && (c !== '-') ? c : s[i > 0 ? ++i : i].toUpperCase());
    }
    return neo.join('');
};
const name1 = ["abandoned", "able", "absolute", "adorable", "adventurous", "academic", "acceptable", "acclaimed", "accomplished", "accurate", "aching", "acidic", "acrobatic", "active", "actual", "adept", "admirable", "admired", "adolescent", "adorable", "adored", "advanced", "afraid", "affectionate", "aged", "aggravating", "aggressive", "agile", "agitated", "agonizing", "agreeable", "ajar", "alarmed", "alarming", "alert", "alienated", "alive", "all", "altruistic", "amazing", "ambitious", "ample", "amused", "amusing", "anchored", "ancient", "angelic", "angry", "anguished", "animated", "annual", "another", "antique", "anxious", "any", "apprehensive", "appropriate", "apt", "arctic", "arid", "aromatic", "artistic", "ashamed", "assured", "astonishing", "athletic", "attached", "attentive", "attractive", "austere", "authentic", "authorized", "automatic", "avaricious", "average", "aware", "awesome", "awful", "awkward", "babyish", "bad", "back", "baggy", "bare", "barren", "basic", "beautiful", "belated", "beloved", "beneficial", "better", "best", "bewitched", "big", "big-hearted", "biodegradable", "bite-sized", "bitter", "black", "black-and-white", "bland", "blank", "blaring", "bleak", "blind", "blissful", "blond", "blue", "blushing", "bogus", "boiling", "bold", "bony", "boring", "bossy", "both", "bouncy", "bountiful", "bowed", "brave", "breakable", "brief", "bright", "brilliant", "brisk", "broken", "bronze", "brown", "bruised", "bubbly", "bulky", "bumpy", "buoyant", "burdensome", "burly", "bustling", "busy", "buttery", "buzzing", "calculating", "calm", "candid", "canine", "capital", "carefree", "careful", "careless", "caring", "cautious", "cavernous", "celebrated", "charming", "cheap", "cheerful", "cheery", "chief", "chilly", "chubby", "circular", "classic", "clean", "clear", "clear-cut", "clever", "close", "closed", "cloudy", "clueless", "clumsy", "cluttered", "coarse", "cold", "colorful", "colorless", "colossal", "comfortable", "common", "compassionate", "competent", "complete", "complex", "complicated", "composed", "concerned", "concrete", "confused", "conscious", "considerate", "constant", "content", "conventional", "cooked", "cool", "cooperative", "coordinated", "corny", "corrupt", "costly", "courageous", "courteous", "crafty", "crazy", "creamy", "creative", "creepy", "criminal", "crisp", "critical", "crooked", "crowded", "cruel", "crushing", "cuddly", "cultivated", "cultured", "cumbersome", "curly", "curvy", "cute", "cylindrical", "damaged", "damp", "dangerous", "dapper", "daring", "darling", "dark", "dazzling", "dead", "deadly", "deafening", "dear", "dearest", "decent", "decimal", "decisive", "deep", "defenseless", "defensive", "defiant", "deficient", "definite", "definitive", "delayed", "delectable", "delicious", "delightful", "delirious", "demanding", "dense", "dental", "dependable", "dependent", "descriptive", "deserted", "detailed", "determined", "devoted", "different", "difficult", "digital", "diligent", "dim", "dimpled", "dimwitted", "direct", "discrete", "distant", "downright", "dreary", "dirty", "disguised", "dishonest", "dismal", "distant", "distinct", "distorted", "dizzy", "dopey", "doting", "double", "downright", "drab", "drafty", "dramatic", "droopy", "dry", "dual", "dutiful", "each", "eager", "earnest", "early", "easy", "easy-going", "ecstatic", "edible", "educated", "elaborate", "elastic", "elated", "elderly", "electric", "elegant", "elementary", "elliptical", "embarrassed", "embellished", "eminent", "emotional", "empty", "enchanted", "enchanting", "energetic", "enlightened", "enormous", "enraged", "entire", "envious", "equal", "equatorial", "essential", "esteemed", "ethical", "euphoric", "even", "evergreen", "everlasting", "every", "evil", "exalted", "excellent", "exemplary", "exhausted", "excitable", "excited", "exciting", "exotic", "expensive", "experienced", "expert", "extraneous", "extroverted", "extra-large", "extra-small", "fabulous", "failing", "faint", "fair", "faithful", "fake", "false", "familiar", "famous", "fancy", "fantastic", "far", "faraway", "far-flung", "far-off", "fast", "fat", "fatal", "fatherly", "favorable", "favorite", "fearful", "fearless", "feisty", "feline", "female", "feminine", "few", "fickle", "filthy", "fine", "finished", "firm", "first", "firsthand", "fitting", "fixed", "flaky", "flamboyant", "flashy", "flat", "flawed", "flawless", "flickering", "flimsy", "flippant", "flowery", "fluffy", "fluid", "flustered", "focused", "fond", "foolhardy", "foolish", "forceful", "forked", "formal", "forsaken", "forthright", "fortunate", "fragrant", "frail", "frank", "frayed", "free", "French", "fresh", "frequent", "friendly", "frightened", "frightening", "frigid", "frilly", "frizzy", "frivolous", "front", "frosty", "frozen", "frugal", "fruitful", "full", "fumbling", "functional", "funny", "fussy", "fuzzy", "gargantuan", "gaseous", "general", "generous", "gentle", "genuine", "giant", "giddy", "gigantic", "gifted", "giving", "glamorous", "glaring", "glass", "gleaming", "gleeful", "glistening", "glittering", "gloomy", "glorious", "glossy", "glum", "golden", "good", "good-natured", "gorgeous", "graceful", "gracious", "grand", "grandiose", "granular", "grateful", "gray", "great", "green", "gregarious", "gripping", "grizzled", "grouchy", "grounded", "growing", "growling", "grown", "grubby", "gruesome", "grumpy", "guilty", "gullible", "gummy", "hairy", "half", "handmade", "handsome", "handy", "happy", "happy-go-lucky", "hard", "hard-to-find", "harmful", "harmless", "harmonious", "harsh", "hasty", "hateful", "haunting", "healthy", "heartfelt", "hearty", "heavenly", "heavy", "hefty", "helpful", "helpless", "hidden", "hideous", "high", "high-level", "hilarious", "hoarse", "hollow", "homely", "honest", "honorable", "honored", "hopeful", "horrible", "hospitable", "hot", "huge", "humble", "humiliating", "humming", "humongous", "hungry", "hurtful", "husky", "icky", "icy", "ideal", "idealistic", "identical", "idle", "idiotic", "idolized", "ignorant", "ill", "illegal", "ill-fated", "ill-informed", "illiterate", "illustrious", "imaginary", "imaginative", "immaculate", "immaterial", "immediate", "immense", "impassioned", "impeccable", "impartial", "imperfect", "imperturbable", "impish", "impolite", "important", "impossible", "impractical", "impressionable", "impressive", "improbable", "impure", "inborn", "incomparable", "incompatible", "incomplete", "inconsequential", "incredible", "indelible", "inexperienced", "indolent", "infamous", "infantile", "infatuated", "inferior", "infinite", "informal", "innocent", "insistent", "instructive", "insubstantial", "intelligent", "intent", "intentional", "interesting", "internal", "international", "intrepid", "ironclad", "itchy", "jaded", "jagged", "jam-packed", "jaunty", "jealous", "jittery", "joint", "jolly", "jovial", "joyful", "joyous", "jubilant", "judicious", "juicy", "jumbo", "junior", "jumpy", "juvenile", "kaleidoscopic", "keen", "key", "kind", "kindhearted", "kindly", "klutzy", "knobby", "knotty", "knowledgeable", "knowing", "known", "kooky", "kosher", "lanky", "large", "last", "lasting", "late", "lavish", "lawful", "lazy", "leading", "lean", "leafy", "left", "legal", "legitimate", "light", "lighthearted", "likable", "likely", "limited", "limp", "limping", "linear", "lined", "liquid", "little", "live", "lively", "livid", "lone", "lonely", "long", "long-term", "loose", "lopsided", "lost", "loud", "lovable", "lovely", "loving", "low", "loyal", "lucky", "lumbering", "luminous", "lumpy", "lustrous", "luxurious", "mad", "made-up", "magnificent", "majestic", "major", "male", "mammoth", "married", "marvelous", "masculine", "massive", "mature", "meager", "mealy", "mean", "measly", "meaty", "medical", "mediocre", "medium", "meek", "mellow", "melodic", "memorable", "menacing", "merry", "messy", "metallic", "mild", "milky", "mindless", "miniature", "minor", "minty", "miserable", "miserly", "misguided", "misty", "mixed", "modern", "modest", "moist", "monstrous", "monthly", "monumental", "moral", "mortified", "motherly", "motionless", "mountainous", "muddy", "muffled", "multicolored", "mundane", "murky", "mushy", "muted", "mysterious", "naive", "narrow", "nasty", "natural", "naughty", "nautical", "near", "neat", "necessary", "negligible", "neighboring", "nervous", "new", "next", "nice", "nifty", "nimble", "nippy", "nocturnal", "noisy", "nonstop", "normal", "notable", "noted", "noteworthy", "novel", "numb", "nutritious", "nutty", "obedient", "oblong", "oily", "oblong", "obvious", "occasional", "odd", "oddball", "offbeat", "offensive", "official", "old", "old-fashioned", "only", "open", "optimal", "optimistic", "opulent", "orange", "orderly", "organic", "ornate", "ornery", "ordinary", "original", "other", "our", "outlying", "outgoing", "outlandish", "outrageous", "outstanding", "oval", "overcooked", "overdue", "overjoyed", "overlooked", "palatable", "pale", "paltry", "parallel", "parched", "partial", "passionate", "past", "pastel", "peaceful", "peppery", "perfect", "perfumed", "periodic", "perky", "personal", "pertinent", "pesky", "pessimistic", "petty", "phony", "physical", "piercing", "pink", "pitiful", "plain", "plaintive", "plastic", "playful", "pleasant", "pleased", "pleasing", "plump", "plush", "polished", "polite", "political", "pointed", "pointless", "poised", "poor", "popular", "portly", "posh", "positive", "possible", "potable", "powerful", "powerless", "practical", "precious", "present", "prestigious", "pretty", "precious", "previous", "pricey", "prickly", "primary", "prime", "pristine", "private", "prize", "probable", "productive", "profitable", "profuse", "proper", "proud", "prudent", "punctual", "pungent", "puny", "pure", "purple", "pushy", "puzzled", "puzzling", "quaint", "qualified", "quarrelsome", "quarterly", "queasy", "querulous", "questionable", "quick", "quick-witted", "quiet", "quintessential", "quirky", "quixotic", "quizzical", "radiant", "ragged", "rapid", "rare", "rash", "raw", "recent", "reckless", "rectangular", "ready", "real", "realistic", "reasonable", "red", "reflecting", "regal", "regular", "reliable", "relieved", "remarkable", "remorseful", "remote", "repentant", "required", "respectful", "responsible", "repulsive", "revolving", "rewarding", "rich", "rigid", "right", "ringed", "ripe", "roasted", "robust", "rosy", "rotating", "rotten", "rough", "round", "rowdy", "royal", "rubbery", "rundown", "ruddy", "runny", "rural", "rusty", "sad", "safe", "salty", "same", "sandy", "sane", "sarcastic", "sardonic", "satisfied", "scaly", "scarce", "scared", "scary", "scented", "scholarly", "scientific", "scratchy", "scrawny", "second", "secondary", "second-hand", "secret", "self-assured", "self-reliant", "selfish", "sentimental", "separate", "serene", "serious", "serpentine", "several", "severe", "shabby", "shadowy", "shady", "shallow", "shameful", "shameless", "sharp", "shimmering", "shiny", "shocked", "shocking", "shoddy", "short", "short-term", "showy", "shrill", "shy", "sick", "silent", "silky", "silly", "silver", "similar", "simple", "simplistic", "sinful", "single", "sizzling", "skeletal", "skinny", "sleepy", "slight", "slim", "slimy", "slippery", "slow", "slushy", "small", "smart", "smoggy", "smooth", "smug", "snappy", "snarling", "sneaky", "sniveling", "snoopy", "sociable", "soft", "soggy", "solid", "somber", "some", "spherical", "sophisticated", "sore", "sorrowful", "soulful", "soupy", "sour", "Spanish", "sparkling", "sparse", "specific", "spectacular", "speedy", "spicy", "spiffy", "spirited", "spiteful", "splendid", "spotless", "spotted", "spry", "square", "squeaky", "squiggly", "stable", "staid", "stained", "stale", "standard", "starchy", "stark", "starry", "steep", "sticky", "stiff", "stimulating", "stingy", "stormy", "straight", "strange", "steel", "strict", "strident", "striking", "striped", "strong", "studious", "stunning", "stupendous", "sturdy", "stylish", "subdued", "submissive", "substantial", "subtle", "suburban", "sudden", "sugary", "sunny", "super", "superb", "superficial", "superior", "supportive", "sure-footed", "surprised", "suspicious", "svelte", "sweet", "sweltering", "swift", "sympathetic", "tall", "talkative", "tame", "tan", "tangible", "tart", "tasty", "tattered", "taut", "tedious", "teeming", "tempting", "tender", "tense", "tepid", "terrible", "terrific", "testy", "thankful", "that", "these", "thick", "thin", "third", "thirsty", "this", "thorough", "thorny", "those", "thoughtful", "threadbare", "thrifty", "thunderous", "tidy", "tight", "timely", "tinted", "tiny", "tired", "torn", "total", "tough", "traumatic", "treasured", "tremendous", "tragic", "trained", "tremendous", "triangular", "tricky", "trifling", "trim", "trivial", "troubled", "true", "trusting", "trustworthy", "trusty", "truthful", "tubby", "turbulent", "twin", "ugly", "ultimate", "unacceptable", "unaware", "uncomfortable", "uncommon", "unconscious", "understated", "unequaled", "uneven", "unfinished", "unfit", "unfolded", "unfortunate", "unhappy", "unhealthy", "uniform", "unimportant", "unique", "united", "unkempt", "unknown", "unlawful", "unlined", "unlucky", "unnatural", "unpleasant", "unrealistic", "unripe", "unruly", "unselfish", "unsightly", "unsteady", "unsung", "untidy", "untimely", "untried", "untrue", "unused", "unusual", "unwelcome", "unwieldy", "unwilling", "unwitting", "unwritten", "upbeat", "upright", "upset", "urban", "usable", "used", "useful", "useless", "utilized", "utter", "vacant", "vague", "vain", "valid", "valuable", "vapid", "variable", "vast", "velvety", "venerated", "vengeful", "verifiable", "vibrant", "vicious", "victorious", "vigilant", "vigorous", "villainous", "violet", "violent", "virtual", "virtuous", "visible", "vital", "vivacious", "vivid", "voluminous", "wan", "warlike", "warm", "warmhearted", "warped", "wary", "wasteful", "watchful", "waterlogged", "watery", "wavy", "wealthy", "weak", "weary", "webbed", "wee", "weekly", "weepy", "weighty", "weird", "welcome", "well-documented", "well-groomed", "well-informed", "well-lit", "well-made", "well-off", "well-to-do", "well-worn", "wet", "which", "whimsical", "whirlwind", "whispered", "white", "whole", "whopping", "wicked", "wide", "wide-eyed", "wiggly", "wild", "willing", "wilted", "winding", "windy", "winged", "wiry", "wise", "witty", "wobbly", "woeful", "wonderful", "wooden", "woozy", "wordy", "worldly", "worn", "worried", "worrisome", "worse", "worst", "worthless", "worthwhile", "worthy", "wrathful", "wretched", "writhing", "wrong", "wry", "yawning", "yearly", "yellow", "yellowish", "young", "youthful", "yummy", "zany", "zealous", "zesty", "zigzag", "rocky"];
const name2 = ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media", "thing", "oven", "community", "definition", "safety", "quality", "development", "language", "management", "player", "variety", "video", "week", "security", "country", "exam", "movie", "organization", "equipment", "physics", "analysis", "policy", "series", "thought", "basis", "boyfriend", "direction", "strategy", "technology", "army", "camera", "freedom", "paper", "environment", "child", "instance", "month", "truth", "marketing", "university", "writing", "article", "department", "difference", "goal", "news", "audience", "fishing", "growth", "income", "marriage", "user", "combination", "failure", "meaning", "medicine", "philosophy", "teacher", "communication", "night", "chemistry", "disease", "disk", "energy", "nation", "road", "role", "soup", "advertising", "location", "success", "addition", "apartment", "education", "math", "moment", "painting", "politics", "attention", "decision", "event", "property", "shopping", "student", "wood", "competition", "distribution", "entertainment", "office", "population", "president", "unit", "category", "cigarette", "context", "introduction", "opportunity", "performance", "driver", "flight", "length", "magazine", "newspaper", "relationship", "teaching", "cell", "dealer", "debate", "finding", "lake", "member", "message", "phone", "scene", "appearance", "association", "concept", "customer", "death", "discussion", "housing", "inflation", "insurance", "mood", "woman", "advice", "blood", "effort", "expression", "importance", "opinion", "payment", "reality", "responsibility", "situation", "skill", "statement", "wealth", "application", "city", "county", "depth", "estate", "foundation", "grandmother", "heart", "perspective", "photo", "recipe", "studio", "topic", "collection", "depression", "imagination", "passion", "percentage", "resource", "setting", "ad", "agency", "college", "connection", "criticism", "debt", "description", "memory", "patience", "secretary", "solution", "administration", "aspect", "attitude", "director", "personality", "psychology", "recommendation", "response", "selection", "storage", "version", "alcohol", "argument", "complaint", "contract", "emphasis", "highway", "loss", "membership", "possession", "preparation", "steak", "union", "agreement", "cancer", "currency", "employment", "engineering", "entry", "interaction", "limit", "mixture", "preference", "region", "republic", "seat", "tradition", "virus", "actor", "classroom", "delivery", "device", "difficulty", "drama", "election", "engine", "football", "guidance", "hotel", "match", "owner", "priority", "protection", "suggestion", "tension", "variation", "anxiety", "atmosphere", "awareness", "bread", "climate", "comparison", "confusion", "construction", "elevator", "emotion", "employee", "employer", "guest", "height", "leadership", "mall", "manager", "operation", "recording", "respect", "sample", "transportation", "boring", "charity", "cousin", "disaster", "editor", "efficiency", "excitement", "extent", "feedback", "guitar", "homework", "leader", "mom", "outcome", "permission", "presentation", "promotion", "reflection", "refrigerator", "resolution", "revenue", "session", "singer", "tennis", "basket", "bonus", "cabinet", "childhood", "church", "clothes", "coffee", "dinner", "drawing", "hair", "hearing", "initiative", "judgment", "lab", "measurement", "mode", "mud", "orange", "poetry", "police", "possibility", "procedure", "queen", "ratio", "relation", "restaurant", "satisfaction", "sector", "signature", "significance", "song", "tooth", "town", "vehicle", "volume", "wife", "accident", "airport", "appointment", "arrival", "assumption", "baseball", "chapter", "committee", "conversation", "database", "enthusiasm", "error", "explanation", "farmer", "gate", "girl", "hall", "historian", "hospital", "injury", "instruction", "maintenance", "manufacturer", "meal", "perception", "pie", "poem", "presence", "proposal", "reception", "replacement", "revolution", "river", "son", "speech", "tea", "village", "warning", "winner", "worker", "writer", "assistance", "breath", "buyer", "chest", "chocolate", "conclusion", "contribution", "cookie", "courage", "desk", "drawer", "establishment", "examination", "garbage", "grocery", "honey", "impression", "improvement", "independence", "insect", "inspection", "inspector", "king", "ladder", "menu", "penalty", "piano", "potato", "profession", "professor", "quantity", "reaction", "requirement", "salad", "sister", "supermarket", "tongue", "weakness", "wedding", "affair", "ambition", "analyst", "apple", "assignment", "assistant", "bathroom", "bedroom", "beer", "birthday", "celebration", "championship", "cheek", "client", "consequence", "departure", "diamond", "dirt", "ear", "fortune", "friendship", "funeral", "gene", "girlfriend", "hat", "indication", "intention", "lady", "midnight", "negotiation", "obligation", "passenger", "pizza", "platform", "poet", "pollution", "recognition", "reputation", "shirt", "speaker", "stranger", "surgery", "sympathy", "tale", "throat", "trainer", "uncle", "youth", "time", "work", "film", "water", "money", "example", "while", "business", "study", "game", "life", "form", "air", "day", "place", "number", "part", "field", "fish", "back", "process", "heat", "hand", "experience", "job", "book", "end", "point", "type", "home", "economy", "value", "body", "market", "guide", "interest", "state", "radio", "course", "company", "price", "size", "card", "list", "mind", "trade", "line", "care", "group", "risk", "word", "fat", "force", "key", "light", "training", "name", "school", "top", "amount", "level", "order", "practice", "research", "sense", "service", "piece", "web", "boss", "sport", "fun", "house", "page", "term", "test", "answer", "sound", "focus", "matter", "kind", "soil", "board", "oil", "picture", "access", "garden", "range", "rate", "reason", "future", "site", "demand", "exercise", "image", "case", "cause", "coast", "action", "age", "bad", "boat", "record", "result", "section", "building", "mouse", "cash", "class", "period", "plan", "store", "tax", "side", "subject", "space", "rule", "stock", "weather", "chance", "figure", "man", "model", "source", "beginning", "earth", "program", "chicken", "design", "feature", "head", "material", "purpose", "question", "rock", "salt", "act", "birth", "car", "dog", "object", "scale", "sun", "note", "profit", "rent", "speed", "style", "war", "bank", "craft", "half", "inside", "outside", "standard", "bus", "exchange", "eye", "fire", "position", "pressure", "stress", "advantage", "benefit", "box", "frame", "issue", "step", "cycle", "face", "item", "metal", "paint", "review", "room", "screen", "structure", "view", "account", "ball", "discipline", "medium", "share", "balance", "bit", "black", "bottom", "choice", "gift", "impact", "machine", "shape", "tool", "wind", "address", "average", "career", "culture", "morning", "pot", "sign", "table", "task", "condition", "contact", "credit", "egg", "hope", "ice", "network", "north", "square", "attempt", "date", "effect", "link", "post", "star", "voice", "capital", "challenge", "friend", "self", "shot", "brush", "couple", "exit", "front", "function", "lack", "living", "plant", "plastic", "spot", "summer", "taste", "theme", "track", "wing", "brain", "button", "click", "desire", "foot", "gas", "influence", "notice", "rain", "wall", "base", "damage", "distance", "feeling", "pair", "savings", "staff", "sugar", "target", "text", "animal", "author", "budget", "discount", "file", "ground", "lesson", "minute", "officer", "phase", "reference", "register", "sky", "stage", "stick", "title", "trouble", "bowl", "bridge", "campaign", "character", "club", "edge", "evidence", "fan", "letter", "lock", "maximum", "novel", "option", "pack", "park", "quarter", "skin", "sort", "weight", "baby", "background", "carry", "dish", "factor", "fruit", "glass", "joint", "master", "muscle", "red", "strength", "traffic", "trip", "vegetable", "appeal", "chart", "gear", "ideal", "librarychen", "land", "log", "mother", "net", "party", "principle", "relative", "sale", "season", "signal", "spirit", "street", "tree", "wave", "belt", "bench", "commission", "copy", "drop", "minimum", "path", "progress", "project", "sea", "south", "status", "stuff", "ticket", "tour", "angle", "blue", "breakfast", "confidence", "daughter", "degree", "doctor", "dot", "dream", "duty", "essay", "father", "fee", "finance", "hour", "juice", "luck", "milk", "mouth", "peace", "pipe", "stable", "storm", "substance", "team", "trick", "afternoon", "bat", "beach", "blank", "catch", "chain", "consideration", "cream", "crew", "detail", "gold", "interview", "kid", "mark", "mission", "pain", "pleasure", "score", "screw", "sex", "shop", "shower", "suit", "tone", "window", "agent", "band", "bath", "block", "bone", "calendar", "candidate", "cap", "coat", "contest", "corner", "court", "cup", "district", "door", "east", "finger", "garage", "guarantee", "hole", "hook", "implement", "layer", "lecture", "lie", "manner", "meeting", "nose", "parking", "partner", "profile", "rice", "routine", "schedule", "swimming", "telephone", "tip", "winter", "airline", "bag", "battle", "bed", "bill", "bother", "cake", "code", "curve", "designer", "dimension", "dress", "ease", "emergency", "evening", "extension", "farm", "fight", "gap", "grade", "holiday", "horror", "horse", "host", "husband", "loan", "mistake", "mountain", "nail", "noise", "occasion", "package", "patient", "pause", "phrase", "proof", "race", "relief", "sand", "sentence", "shoulder", "smoke", "stomach", "string", "tourist", "towel", "vacation", "west", "wheel", "wine", "arm", "aside", "associate", "bet", "blow", "border", "branch", "breast", "brother", "buddy", "bunch", "chip", "coach", "cross", "document", "draft", "dust", "expert", "floor", "god", "golf", "habit", "iron", "judge", "knife", "landscape", "league", "mail", "mess", "native", "opening", "parent", "pattern", "pin", "pool", "pound", "request", "salary", "shame", "shelter", "shoe", "silver", "tackle", "tank", "trust", "assist", "bake", "bar", "bell", "bike", "blame", "boy", "brick", "chair", "closet", "clue", "collar", "comment", "conference", "devil", "diet", "fear", "fuel", "glove", "jacket", "lunch", "monitor", "mortgage", "nurse", "pace", "panic", "peak", "plane", "reward", "row", "sandwich", "shock", "spite", "spray", "surprise", "till", "transition", "weekend", "welcome", "yard", "alarm", "bend", "bicycle", "bite", "blind", "bottle", "cable", "candle", "clerk", "cloud", "concert", "counter", "flower", "grandfather", "harm", "knee", "lawyer", "leather", "load", "mirror", "neck", "pension", "plate", "purple", "ruin", "ship", "skirt", "slice", "snow", "specialist", "stroke", "switch", "trash", "tune", "zone", "anger", "award", "bid", "bitter", "boot", "bug", "camp", "candy", "carpet", "cat", "champion", "channel", "clock", "comfort", "cow", "crack", "engineer", "entrance", "fault", "grass", "guy", "hell", "highlight", "incident", "island", "joke", "jury", "leg", "lip", "mate", "motor", "nerve", "passage", "pen", "pride", "priest", "prize", "promise", "resident", "resort", "ring", "roof", "rope", "sail", "scheme", "script", "sock", "station", "toe", "tower", "truck", "witness", "can", "will", "other", "use", "make", "good", "look", "help", "go", "great", "being", "still", "public", "read", "keep", "start", "give", "human", "local", "general", "specific", "long", "play", "feel", "high", "put", "common", "set", "change", "simple", "past", "big", "possible", "particular", "major", "personal", "current", "national", "cut", "natural", "physical", "show", "try", "check", "second", "call", "move", "pay", "let", "increase", "single", "individual", "turn", "ask", "buy", "guard", "hold", "main", "offer", "potential", "professional", "international", "travel", "cook", "alternative", "special", "working", "whole", "dance", "excuse", "cold", "commercial", "low", "purchase", "deal", "primary", "worth", "fall", "necessary", "positive", "produce", "search", "present", "spend", "talk", "creative", "tell", "cost", "drive", "green", "support", "glad", "remove", "return", "run", "complex", "due", "effective", "middle", "regular", "reserve", "independent", "leave", "original", "reach", "rest", "serve", "watch", "beautiful", "charge", "active", "break", "negative", "safe", "stay", "visit", "visual", "affect", "cover", "report", "rise", "walk", "white", "junior", "pick", "unique", "classic", "final", "lift", "mix", "private", "stop", "teach", "western", "concern", "familiar", "fly", "official", "broad", "comfortable", "gain", "rich", "save", "stand", "young", "heavy", "lead", "listen", "valuable", "worry", "handle", "leading", "meet", "release", "sell", "finish", "normal", "press", "ride", "secret", "spread", "spring", "tough", "wait", "brown", "deep", "display", "flow", "hit", "objective", "shoot", "touch", "cancel", "chemical", "cry", "dump", "extreme", "push", "conflict", "eat", "fill", "formal", "jump", "kick", "opposite", "pass", "pitch", "remote", "total", "treat", "vast", "abuse", "beat", "burn", "deposit", "print", "raise", "sleep", "somewhere", "advance", "consist", "dark", "double", "draw", "equal", "fix", "hire", "internal", "join", "sensitive", "tap", "win", "attack", "claim", "constant", "drag", "drink", "guess", "minor", "pull", "raw", "soft", "solid", "wear", "weird", "wonder", "annual", "count", "dead", "doubt", "feed", "forever", "impress", "repeat", "round", "sing", "slide", "strip", "wish", "combine", "command", "dig", "divide", "equivalent", "hang", "hunt", "initial", "march", "mention", "spiritual", "survey", "tie", "adult", "brief", "crazy", "escape", "gather", "hate", "prior", "repair", "rough", "sad", "scratch", "sick", "strike", "employ", "external", "hurt", "illegal", "laugh", "lay", "mobile", "nasty", "ordinary", "respond", "royal", "senior", "split", "strain", "struggle", "swim", "train", "upper", "wash", "yellow", "convert", "crash", "dependent", "fold", "funny", "grab", "hide", "miss", "permit", "quote", "recover", "resolve", "roll", "sink", "slip", "spare", "suspect", "sweet", "swing", "twist", "upstairs", "usual", "abroad", "brave", "calm", "concentrate", "estimate", "grand", "male", "mine", "prompt", "quiet", "refuse", "regret", "reveal", "rush", "shake", "shift", "shine", "steal", "suck", "surround", "bear", "brilliant", "dare", "dear", "delay", "drunk", "female", "hurry", "inevitable", "invite", "kiss", "neat", "pop", "punch", "quit", "reply", "representative", "resist", "rip", "rub", "silly", "smile", "spell", "stretch", "tear", "temporary", "tomorrow", "wake", "wrap", "yesterday"];


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "async": () => (/* binding */ async),
/* harmony export */   "asyncTask": () => (/* binding */ asyncTask),
/* harmony export */   "debounce": () => (/* binding */ debounce)
/* harmony export */ });
/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/**
 * Perform `action` if `delay` ms have elapsed since last debounce call for `key`.
 *
 * ```
 * // invoke 'task' one second after last time this line executed
 * this.debounceTask = debounce(this.debounceTask, task, 1000);
 * ```
 */
const debounce = (key, action, delay) => {
    if (key) {
        clearTimeout(key);
    }
    if (action && delay) {
        return setTimeout(action, delay);
    }
};
const async = task => {
    return async (...args) => {
        await Promise.resolve();
        task(...args);
    };
};
const asyncTask = (task, delayMs) => {
    setTimeout(task, delayMs ?? 0);
};


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Services = exports.Basic = void 0;
const ServicePortal = class {
    constructor() {
        this.handlers = [];
    }
    add(handler) {
        this.handlers.push(handler);
        return this;
    }
    async handle(runtime, host, request) {
        log('handle:', request, 'handlers:', this.handlers.length);
        for (const handler of this.handlers) {
            const value = await handler(runtime, host, request);
            if (value !== undefined) {
                return value;
            }
        }
    }
};
exports.Basic = {
    system: async (runtime, host, request) => {
        switch (request.msg) {
            case 'request-context': {
                return {
                    runtime
                };
            }
        }
    },
    user: async (runtime, host, request) => {
        switch (request.msg) {
            case 'particle-error': {
                //console.error(error);
            }
        }
    }
};
exports.Services = {
    system: new ServicePortal().add(exports.Basic.system),
    user: new ServicePortal().add(exports.Basic.user)
};


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootArcs = void 0;
;
const config = {
    // false to use CDN resources
    localArcsjs: true,
    // identifies the p2p meeting place, peers must be in this same aeon
    // also identifies offline storage node
    aeon: 'vscode-arcsjs/00x00',
    // each flag below set true enables logging for the named subsystem
    // TODO(wkorman): Understand and document each of below (and aeon).
    logFlags: {
        recipe: true,
        host: true,
        decorator: true,
        particles: true,
        surfaces: true
    }
};
globalThis.config = config;
const arcs_1 = __webpack_require__(2);
const ServicePortal_1 = __webpack_require__(29);
async function bootArcs(context, updater) {
    globalThis.config = config;
    const MarkdownRecipe = eval(await fetch(arcs_1.Paths.resolve('$root/MarkdownRecipe.js')).then(p => p.text()));
    const MarkdownParticle = await fetch(arcs_1.Paths.resolve('$root/MarkdownParticle.js')).then(p => p.text());
    arcs_1.Runtime.particleOptions = { code: MarkdownParticle };
    const system = new arcs_1.Runtime('system');
    const arc = await system.bootstrapArc('system', {}, null, ServicePortal_1.Services.system);
    console.log('arc booted ' + arc);
    arc.listen('store-changed', (storeId) => {
        const store = arc.stores[storeId];
        if (storeId === 'html') {
            updater(store.data);
        }
        console.log("Store " + storeId + " = " + store.json);
    });
    await arcs_1.Chef.execute(MarkdownRecipe, system, arc);
    return arc;
}
exports.bootArcs = bootArcs;


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getNonce = exports.ArcsViewProvider = void 0;
const vscode = __webpack_require__(1);
const app_1 = __webpack_require__(30);
class ArcsViewProvider {
    constructor(context) {
        this.context = context;
        this.context = context;
        (0, app_1.bootArcs)(context, (html) => {
            this.updateWebview(html);
        }).then((arc) => {
            // Use the console to output diagnostic information (console.log) and errors (console.error)
            // This line of code will only be executed once when your extension is activated
            vscode.window.showInformationMessage('Arcs Booted!');
            this._arc = arc;
        });
    }
    updateWebview(html) {
        this._view?.webview?.postMessage({
            type: 'update',
            text: html
        });
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this.context.extensionUri
            ]
        };
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (this._arc) {
                this._arc.stores['markdown'].data = e.document.getText();
            }
        });
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        webviewView.webview.show?.(true);
    }
    /**
     * Get the static html used for the editor webviews.
     */
    getHtmlForWebview(webview) {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'arcsEditor.js'));
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<title>Arcs View</title>
			</head>
			<body>
            <div id=doc></div>
			<script nonce="${nonce}" src="${scriptUri}"></script>
                
			</body>
			</html>`;
    }
    /**
     * Add a new scratch to the current document.
     */
    addNewScratch(document) {
        const json = this.getDocumentAsJson(document);
        const character = 'X';
        json.scratches = [
            ...(Array.isArray(json.scratches) ? json.scratches : []),
            {
                id: getNonce(),
                text: character,
                created: Date.now(),
            }
        ];
        return this.updateTextDocument(document, json);
    }
    /**
     * Delete an existing scratch from a document.
     */
    deleteScratch(document, id) {
        const json = this.getDocumentAsJson(document);
        if (!Array.isArray(json.scratches)) {
            return;
        }
        json.scratches = json.scratches.filter((note) => note.id !== id);
        return this.updateTextDocument(document, json);
    }
    /**
     * Try to get a current document as json text.
     */
    getDocumentAsJson(document) {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch {
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }
    /**
     * Write out the json to a given document.
     */
    updateTextDocument(document, json) {
        const edit = new vscode.WorkspaceEdit();
        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));
        return vscode.workspace.applyEdit(edit);
    }
}
exports.ArcsViewProvider = ArcsViewProvider;
ArcsViewProvider.viewType = 'arcsCustoms.arcsView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getNonce = getNonce;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
const viewprovider_1 = __webpack_require__(31);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('arcsjs.Arcs', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from arcsjs in a web extension host!');
    });
    context.subscriptions.push(disposable);
    const provider = new viewprovider_1.ArcsViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(viewprovider_1.ArcsViewProvider.viewType, provider));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=extension.js.map