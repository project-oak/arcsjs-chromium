/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const MultiRecipeIr = `
module m0 {
  block b0 {
    %2 = arcsjs.create_store[name: "ArrayOfRecipe.CameraNode1:stream", type: "Stream"]()
    %4 = arcsjs.create_store[name: "ArrayOfRecipe.CameraNode1:frame", type: "Image"]()
    %1 = arcsjs.create_store[name: "ArrayOfRecipe.CameraNode1:mediaDevices", type: "List_JSON"]()
    %0 = arcsjs.create_store[name: "ArrayOfRecipe.CameraNode1:mediaDeviceState", type: "MedaDeviceState"]()
    %3 = arcsjs.create_store[name: "ArrayOfRecipe.CameraNode1:fps", type: "Number"]()
    %5 = arcsjs.create_store[name: "ArrayOfRecipe.ImageNode1:image", type: "Image"]()
    %6 = arcsjs.claim[tag: "private"](%4)
    %16 = arcsjs.claim[tag: "private"](%4)
    %21 = arcsjs.claim[tag: "private"](%4)
    %7 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:camera"]()
    %10 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:deviceUx"]()
    %13 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:defaultStream"]()
    %17 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:imageCapture"]()
    %22 = arcsjs.particle[name: "ArrayOfRecipe.ImageNode1:image"]()
    %11 = arcsjs.connect_input[name: "mediaDevices"](%10, %1)
    %14 = arcsjs.connect_input[name: "mediaDeviceState"](%13, %0)
    %18 = arcsjs.connect_input[name: "stream"](%17, %2)
    %19 = arcsjs.connect_input[name: "fps"](%17, %3)
    %23 = arcsjs.connect_input[name: "connectedImage"](%22, %4)
    %8 = arcsjs.connect_output[name: "stream"](%7, %2)
    %9 = arcsjs.connect_output[name: "frame"](%7, %4)
    %12 = arcsjs.connect_output[name: "mediaDeviceState"](%10, %0)
    %15 = arcsjs.connect_output[name: "mediaDevices"](%13, %1)
    %20 = arcsjs.connect_output[name: "frame"](%17, %4)
    %24 = arcsjs.connect_output[name: "image"](%22, %5)
    %25 = arcsjs.make_public[](%5)
  }
}
`;