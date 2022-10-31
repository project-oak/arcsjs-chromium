/* global chrome */

// chrome.action.onClicked.addListener(async () => {
//   const url = chrome.runtime.getURL("manifest.html");
//   /*const tab = */await chrome.tabs.create({url});
// });
import './conf/config.js';
import {PortBus} from './portbus.js';

// Hardcoded for now, but we want ExtensionManager to allow
// dynamic installation of recipes from the Web/Extension Repo
import {bootPasswordExt} from './Library/PasswordApp/PasswordApp.js';

// TODO: hack, add in arcs store based handling
let extensions = [];
const EXTENSIONS_KEY = 'user/extension/0.0.1/extensions';
chrome.storage.local.get([EXTENSIONS_KEY], (result) => {
  try {
    extensions = JSON.parse(result[EXTENSIONS_KEY] || "[]");
  } catch(e) {
    console.log("error parsing stored extensions data.");
    extensions = [];
  }
});

// Inject content-script on load
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    if (!tab.url.match(/^http/)) {
      return;
    } // Wrong scheme
    chrome.tabs.executeScript(tabId,
        {file: 'harness-content.js', allFrames: true,}, function () {
          //script injected
        });
  }
});

let pwapps = {};
let apps = {
  'Password Manager': bootPasswordExt
};

chrome.runtime.onConnect.addListener(async function (port) {
  const socket = new PortBus(port);
  pwapps[port.name] = null;
  port.onDisconnect.addListener((port) => {
    if (port.name in pwapps) {
      // app.shutdown needed?
      console.log(`Port ${port.name} disconnected`);
      delete pwapps[port.name];
    }
  });

  const receiveVibrations = msg => {
    if (msg.kind == 'extensions-update') {
       extensions = msg.extensions;
    }
    else if (msg.kind === 'loaded') {
      // Right now, boot one PW manager per content-script
      // However, we want to change this to a model where
      // Particles are expected to handle multiple domains
      extensions.filter(({_, enabled}) => enabled).forEach(async extension => {
        const app = await apps[extension.name](port.name, socket, (result) => socket.sendVibration(
            {kind: 'extension-result', ...result}));
        pwapps[port.name] = app;
      });
    } else if (msg.kind === 'focus') {
      pwapps[port.name]?.focus(msg.focusElement);
    } else {
      pwapps[port.name]?.forwardToWorkerBus(msg);
    }
  };

  socket.receiveVibrations(receiveVibrations);
});