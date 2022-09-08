/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const SimpleRecipeIr = `
module m0 {
  block b0 {
    %0 = arcsjs.create_store[name: "SimpleRecipe.public_texts",type: "[Text]"]()
    %1 = arcsjs.create_store[name: "SimpleRecipe.ignored_data",type: "[Text]"]()
    %2 = arcsjs.create_store[name: "SimpleRecipe.output",type: "[Text]"]()
    %3 = sql.tag_transform[rule_name: "set_public"](%0)
    %4 = sql.tag_transform[rule_name: "set_public"](%2)
    %5 = arcsjs.particle[name: "SimpleRecipe.exfil_particle",input_0: "bar",input_1: "foo"](%3,%1)
    %6 = sql.sql_output[handle_name: "baz"](%5)
  }
}
`;