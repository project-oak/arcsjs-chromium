/**
 * @license
 * Copyright 2020 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {Composer} from '../../../../../arcs-import.js';
import {Template} from '../../../../../Library/Common/dom/xen/xen-template.js';
import {IconsCss} from '../../../../../Library/Common/dom/material-icon-font/icons.css.js';
import {XenCss} from '../../../../../Library/Common/dom/material-xen/xen.css.js';
import {dom} from '../../dom.js';

//const log = logFactory(logFactory.flags.composer, 'composer', 'red');

const sanitizeId = id => id.replace(/[)(:]/g, '_');

export class XenComposer extends Composer {
  constructor(root, useShadowRoot) {
    super();
    this.root = root;
    this.useShadowRoot = useShadowRoot;
  }
  setRoot(root) {
    this.root = root;
    this.processPendingPackets();
  }
  findContainer(container) {
    let node = this.root;
    if (container && container !== 'root') {
      const [particle, slot] = container.split('#');
      const owner = deepQuerySelector(node, `#${sanitizeId(particle)}`);
      node = !owner ? null : deepQuerySelector(owner, `[slot=${slot}], [frame=${slot}]`);
    }
    return node;
  }
  generateSlot(id, template, parent) {
    if (!parent) {
      throw Error('Cannot generateSlot without a parent node');
    }
    const container = dom('div', {
      style: 'flex: 1; display: flex; flex-direction: column;',
      id: sanitizeId(id)
    }, parent);
    container.setAttribute('particle', id);
    const root = this.useShadowRoot ? container.attachShadow({mode: `open`}) : container;
    const slot = Template
      .stamp(template)
      .appendTo(root)
      .events(this.mapEvent.bind(this, id))
    ;
    const css = `/*injected by webarcs composer*/${IconsCss}${XenCss}`;
    dom('style', {innerHTML: css}, root);
    return slot;
  }
  clearSlot(slot) {
    slot.root.host.remove();
  }
  mapEvent(pid, node, type, handler) {
    node.addEventListener(type, e => {
      // TODO(sjmiles): just added this 6/2020 for no bubbling; would have sworn there was already no bubbling
      e.stopPropagation();
      e.preventDefault();
      const data = {key: null, value: null};
      // walk up the event path to find the topmost key/value data
      const branch = e.composedPath();
      for (let elt of branch) {
        if (elt.nodeType === Node.ELEMENT_NODE) {
          if ('key' in elt) {
            data.key = elt.key;
          } else if (elt.hasAttribute('key')) {
            data.key = elt.getAttribute('key');
          }
          if ('value' in elt && elt.value !== undefined) {
            data.value = elt.value;
          } else if ('checked' in elt && elt.checked !== undefined) {
            data.value = elt.checked;
          } else if ('value' in elt) {
            data.value = elt.value;
          } else if (elt.hasAttribute('value')) {
            data.value = elt.getAttribute('value');
          }
        }
        if (e.currentTarget === elt || data.key || data.value) {
          break;
        }
      }
      const eventlet = {name: type, handler, data};
      this.onevent(pid, eventlet);
    });
  }
  requestFontFamily(fontFamily) {
    const props = {
      rel: 'stylesheet',
      href: `https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap`
    };
    dom('link', props, document.head);
    return true;
  }
}

// move to dom.js?
const deepQuerySelector = (root, selector) => {
  const find = (element, selector) => {
    let result;
    while (element && !result) {
      result =
          (element.matches && element.matches(selector) ? element : null)
          || find(element.firstElementChild, selector)
          || (element.shadowRoot && find(element.shadowRoot.firstElementChild, selector))
          ;
      element = element.nextElementSibling;
    }
    return result;
  };
  return find(root || document.body, selector);
};

// const deepQuerySelectorAll = (root, selector) => {
//   const findAll = (element, selector) => {
//     let result = [];
//     while (element) {
//       result = result.concat(
//           (element.matches && element.matches(selector) ? [element] : [])
//           || findAll(element.firstElementChild, selector)
//           || (element.shadowRoot && findAll(element.shadowRoot.firstElementChild, selector))
//       );
//       element = element.nextElementSibling;
//     }
//     return result;
//   };
//   return findAll(root || document.body, selector);
// };

// export const showSlots = () => {
//   const slots = deepQuerySelectorAll(document.body, `[particle]`);
//   console.warn(slots);
// };
