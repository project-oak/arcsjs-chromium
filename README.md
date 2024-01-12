***Note: This project is no longer being maintained***

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/cromwellian/arcsjs-chromium-explainer)

## Secure Font Picker using ArcsJs

This is a prototype implementation of a picker API for Chrome built on
[ArcsJs](https://github.com/project-oak/arcsjs-core) that allows permission-less
access to fingerprintable resources while being extensible, and fingerprint
resistant. This allows developers to create custom font pickers like the one
shown below without accessing the full set of local fonts.

For documentation and sample code, see
the [explainer](pkg/demo/explainer/README.md).

For a more sophisticated, full-featured demo, see the integration of 
[FontChooser](pkg/demo/fonts/) and [PhotoChooser](pkg/demo/photos/) inside the [QuillJS rich text editor](https://project-oak.github.io/arcsjs-chromium/demo/quill/index.html).
