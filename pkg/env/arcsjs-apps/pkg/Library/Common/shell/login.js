/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {GoogleLogin} from '../../Firebase/google-login.js';
import {FirebasePromise} from './firebase.js';

export const awaitLoginChange = async onLogin => {
  // wait for a Google Login
  GoogleLogin.enable(FirebasePromise, login => {
    // setTimeout() to get us off the Firebase call stack
    setTimeout(() => onLogin(auth, login), 100);
  });
};

const auth = {
  signOut() {
    GoogleLogin.signOut(FirebasePromise);
  },
  signInAnonymously() {
    GoogleLogin.signInAnonymously(FirebasePromise);
  },
  signInPopup() {
    GoogleLogin.signInPopup(FirebasePromise);
  },
  signInRedirect() {
    GoogleLogin.signInWithRedirect(FirebasePromise);
  }
};
