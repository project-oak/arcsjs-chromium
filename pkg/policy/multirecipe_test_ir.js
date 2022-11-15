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
    %6 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:camera"]()
    %9 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:deviceUx", input_0: "mediaDevices"](%1)
    %11 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:defaultStream", input_0: "mediaDeviceState"](%0)
    %13 = arcsjs.particle[name: "ArrayOfRecipe.CameraNode1:imageCapture", input_0: "stream", input_1: "fps"](%2, %3)
    %7 = arcsjs.select_field[name: "stream"](%6)
    %8 = arcsjs.select_field[name: "frame"](%6)
    %10 = arcsjs.select_field[name: "mediaDeviceState"](%9)
    %12 = arcsjs.select_field[name: "mediaDevices"](%11)
    %14 = arcsjs.select_field[name: "frame"](%13)
    %15 = arcsjs.arcsjs_output[](%7, %8, %10, %12, %14)
  }
}
`;