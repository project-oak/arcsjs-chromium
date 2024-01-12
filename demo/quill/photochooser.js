/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {PhotoChooser} from './modules/photochooser.js';
import {BlobImage} from './formats/blobimage.js';
import {ArcsTheme} from './themes/arcs.js';


Quill.register({
  'modules/photochooser': PhotoChooser,
  'formats/blobimage': BlobImage,
  'themes/arcs': ArcsTheme
}, true);

(function() {
  $(document).ready(function() {
    var fonts = ['sofia', 'slabo', 'roboto', 'inconsolata', 'ubuntu'];
    var Font = Quill.import('formats/font');
    Font.whitelist = fonts;
    Quill.register(Font, true);
    var bubbleEditor = new Quill('#bubble-container .editor', {
      bounds: '#bubble-container .editor',
      modules: {
        'syntax': true
      },
      theme: 'bubble'
    });

    var snowEditor = new Quill('#snow-container .editor', {
      bounds: '#snow-container .editor',
      modules: {
        'syntax': true,
        'photochooser': true,
        'toolbar': '#snow-container .toolbar'
      },
      theme: 'arcs'
    });

    var fullEditor = new Quill('#full-container .editor', {
      bounds: '#full-container .editor',
      modules: {
        'syntax': true,
        'photochooser': true,
        'toolbar': [
          [{ 'font': fonts }, { 'size': [] }],
          [ 'bold', 'italic', 'underline', 'strike' ],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'super' }, { 'script': 'sub' }],
          [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block' ],
          [{ 'list': 'ordered' }, { 'list': 'bullet'}, { 'indent': '-1' }, { 'indent': '+1' }],
          [ 'direction', { 'align': [] }],
          [
            'link',
            'image',
            'video',
            'formula'
          ],
          [ 'clean' ]
        ],
      },
      theme: 'arcs'
    });

    var editors = [bubbleEditor, snowEditor, fullEditor];
    switchEditor(2, fullEditor, true);
    var initialContent = snowEditor.getContents();
    bubbleEditor.setContents(initialContent);
    fullEditor.setContents(initialContent);

    $('.camera').click(function() {
      var index = $(this).index();
      $('#above-container').addClass('demo-active');
      switchEditor(index, editors[index]);
    });

    $('#above-container .prev').click(function() {
      var index = editors.indexOf(window.quill) - 1;
      switchEditor(index, editors[index]);
    });
    $('#above-container .next').click(function() {
      var index = editors.indexOf(window.quill) + 1;
      switchEditor(index, editors[index]);
    });

    var users = [{
      'Intuit': 'https://www.intuit.com/',
      'LinkedIn': 'https://www.linkedin.com/',
      'Microsoft': 'https://www.microsoft.com/',
      'Salesforce': 'https://www.salesforce.com/',
      'Slack': 'https://slack.com/',
    }, {
      'Asana': 'https://asana.com/',
      'Gannett': 'http://www.gannett.com/',
      'Gusto': 'https://www.gusto.com/',
      'Hubspot': 'https://www.hubspot.com/',
      'Mode Analytics': 'https://modeanalytics.com/',
      'USA Today': 'https://www.usatoday.com/',
    }, {
      'Buffer': 'https://buffer.com/',
      'Front': 'https://frontapp.com/',
      'Lever': 'https://www.lever.co/',
      'Reedsy': 'https://reedsy.com/',
      'Slab': 'https://slab.com/',
      'Vox Media': 'https://www.voxmedia.com/'
    }];
    // Show users randomly
    $('#users-container a').each(function(i, link) {
      var bucket = users[i];
      var keys = Object.keys(bucket);
      var name = keys[Math.floor(Math.random() * keys.length)];
      $(link).attr({
        href: bucket[name],
        title: name,
        class: 'user-' + (name.toLowerCase().replace(/\s/g, ''))
      });
    });

    $('#demo-container .ql-editor').one('touchstart', function(event) {
      $('#above-container').addClass('demo-active');
      event.preventDefault();
    });

    $('#demo-container .ql-editor').one('focus', function(event) {
      if (!$('#above-container').hasClass('demo-active')) {
        $('#above-container').addClass('demo-active');
      }
    });

    loadFonts();
    $('#carousel-container').animate({ opacity: 1 }, 500);

    console.log("Welcome to Quill!\n\nThe editor on this page is available via `quill`. Give the API a try:\n\n\tquill.formatText(11, 4, 'bold', true);\n\nVisit the API documenation page to learn more: https://quilljs.com/docs/api/\n");
  });

  function loadFonts() {
    window.WebFontConfig = {
      google: { families: [ 'Inconsolata::latin', 'Ubuntu+Mono::latin', 'Slabo+27px::latin', 'Roboto+Slab::latin' ] }
    };
    (function() {
      var wf = document.createElement('script');
      wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();
  }

  function switchEditor(i, editor, skip) {
    // Expose as global so people can easily try out the API
    window.quill = editor;
    if (!skip) console.info('window.quill is now bound to', editor);

    $('.camera').removeClass('active');
    $('.camera:eq(' + i + ')').addClass('active');

    $('.prev, .next').css('visibility', 'visible');
    if (i === 0) $('.prev').css('visibility', 'hidden');
    if (i === 2) $('.next').css('visibility', 'hidden');

    $('#carousel-container').css('margin-left', (i*-100) + '%');
  }
})();

export {
  PhotoChooser, BlobImage, ArcsTheme
}