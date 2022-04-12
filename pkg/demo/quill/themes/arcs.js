/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const SnowTheme = Quill.import('themes/snow');
const Picker = Quill.import("ui/picker");
const IconPicker = Quill.import("ui/icon-picker");
const ColorPicker = Quill.import("ui/color-picker");

const FontClass = Quill.import("attributors/class/font");
const FontStyle = Quill.import("attributors/style/font");
import {chooseFont} from '../app.js';

const ALIGNS = [false, 'center', 'right', 'justify'];

const COLORS = [
  '#000000',
  '#e60000',
  '#ff9900',
  '#ffff00',
  '#008a00',
  '#0066cc',
  '#9933ff',
  '#ffffff',
  '#facccc',
  '#ffebcc',
  '#ffffcc',
  '#cce8cc',
  '#cce0f5',
  '#ebd6ff',
  '#bbbbbb',
  '#f06666',
  '#ffc266',
  '#ffff66',
  '#66b966',
  '#66a3e0',
  '#c285ff',
  '#888888',
  '#a10000',
  '#b26b00',
  '#b2b200',
  '#006100',
  '#0047b2',
  '#6b24b2',
  '#444444',
  '#5c0000',
  '#663d00',
  '#666600',
  '#003700',
  '#002966',
  '#3d1466',
];

const FONTS = [false, 'serif', 'monospace'];

const HEADERS = ['1', '2', '3', false];

const SIZES = ['small', false, 'large', 'huge'];


class ArcsPicker extends Picker {
  constructor(select) {
    super(select);
    this.chooser = document.createElement("div");
    this.chooser.setAttribute("menu", "true");
    this.container.appendChild(this.chooser);
  }

  togglePicker() {
    this.chooser.setAttribute("show", "true");
    chooseFont('QuillFontPicker', this.chooser).then(font => {
      this.chooser.removeAttribute("show");
      // We shove the chosen font into <option> in slot 0
      let option = this.select.getElementsByTagName("option")[0];
      const familyName = font.family;
      option.innerHTML = familyName;
      const familyNameIdent = familyName.toLowerCase();
      option.setAttribute("value", familyNameIdent);
      const item = this.options.getElementsByTagName("span")[0];
      item.setAttribute("data-label", familyName);
      item.setAttribute("data-value", familyNameIdent);
      item.setAttribute("value", familyNameIdent);
      // we must insert an @font-face rule for the font
      // TODO: de-dup these
      const style = document.createElement("style");
      style.innerText = `
                .ql-font-${familyNameIdent} {
                  font-family: ${familyName}, sans-serif;
                }
                @font-face {
                  font-family: '${familyName}';
                  src: local('${familyName}');
                }`;
      document.head.appendChild(style);

      // Add font to whitelist
      const whitelist = FontClass.whitelist;
      if (whitelist.indexOf(familyNameIdent) == -1) {
        whitelist.push(familyNameIdent);
      }

      // Open the non-Arcs picker
      super.togglePicker();
      option.removeAttribute("selected");
      // pretend to click on the Arcs font at option 0
      jQuery(item).click();
    });
  }
}

class ArcsTheme extends SnowTheme {
  constructor(quill, options) {
    super(quill, options);
  }

  buildPickers(selects, icons) {
    this.pickers = Array.from(selects).map(select => {
      if (select.classList.contains('ql-align')) {
        if (select.querySelector('option') == null) {
          fillSelect(select, ALIGNS);
        }
        return new IconPicker(select, icons.align);
      }
      if (
          select.classList.contains('ql-background') ||
          select.classList.contains('ql-color')
      ) {
        const format = select.classList.contains('ql-background')
            ? 'background'
            : 'color';
        if (select.querySelector('option') == null) {
          fillSelect(
              select,
              BaseTheme.COLORS,
              format === 'background' ? '#ffffff' : '#000000',
          );
        }
        return new ColorPicker(select, icons[format]);
      }
      if (select.querySelector('option') == null) {
        if (select.classList.contains('ql-font')) {
          fillSelect(select, FONTS);
        } else if (select.classList.contains('ql-header')) {
          fillSelect(select, HEADERS);
        } else if (select.classList.contains('ql-size')) {
          fillSelect(select, SIZES);
        }
      }
      if (select.classList.contains('ql-font')) {
        return new ArcsPicker(select);
      } else {
        return new Picker(select);
      }
    });
    const update = () => {
      this.pickers.forEach(picker => {
        picker.update();
      });
    };
    this.quill.on('editor-change', update);
  }
}

export {
  ArcsTheme
};