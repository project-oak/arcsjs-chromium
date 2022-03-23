/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const second = 1000;

const server = `http://behelits.com:3000/publish/`;

export async function subscribe(onmessage) {
  console.log('subscribing...');
  const response = await fetch("http://behelits.com:3000/subscribe");
  console.log('got response: ', response.status);
  if (response.status >= 500 && response.status < 600) {
    // Try to reconnect for all 5xx
    //
    // Status 502 is a connection timeout error,
    // may happen when the connection was pending for too long,
    // and the remote server or a proxy closed it
    //
    // let's reconnect in 30s (should backoff)
    setTimeout(() => subscribe(onmessage), 30 * second);
  }
  else if (response.status != 200) {
    // An error - let's show it
    console.log('width error: ', response.statusText);
    // Reconnect in one second
    await new Promise(resolve => setTimeout(resolve, 1 * second));
    await subscribe(onmessage);
  }
  else {
    // Get the message
    const message = await response.text();
    console.log('with text: ', message);
    onmessage(message);
    // Call subscribe() again to get the next message
    await subscribe(onmessage);
  }
}

export const publish = async pojo => {
  console.log('sending...', pojo);
  // Default options are marked with *
  await fetch(server, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(pojo) // body data type must match "Content-Type" header
  });
};