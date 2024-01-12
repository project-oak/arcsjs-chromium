/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/*
 %0 = arcsjs.create_store [name: "SimpleRecipe.public_texts", type: "[Text]"]()
    %1 = arcsjs.create_store [name: "SimpleRecipe.ignored_data", type: "[Text]"]()
    %2 = sql.tag_transform [rule_name: "set_public"](%0) // claim public
    %3 = arcsjs.particle [name: "SimpleRecipe.exfil_particle", input_0: "bar", input_1: "foo"](%2, %1)
    // Policy check passes because we are not declassifying data.
    %4 = sql.sql_output [handle_name: "baz"](%3) // TODO: Update to arcsjs.connect_output / a service call etc.
  }  // block b0
}  // module m0
 */

export const SimpleRecipeProto = {
  "topLevelModule": {
    "blocks": [{
      "id": 7, "block": {
        "operations": [{
          "id": 0,
          "operation": {
            "operatorName": "arcsjs.create_store",
            "inputs": [],
            "attributes": {
              "attributes": {
                "name": {"stringPayload": "SimpleRecipe.public_texts"},
                "type": {"stringPayload": "[Text]"}
              }
            }
          }
        }, {
          "id": 1,
          "operation": {
            "operatorName": "arcsjs.create_store",
            "inputs": [],
            "attributes": {
              "attributes": {
                "name": {"stringPayload": "SimpleRecipe.ignored_data"},
                "type": {"stringPayload": "[Text]"}
              }
            }
          }
        }, {
          "id": 2,
          "operation": {
            "operatorName": "arcsjs.create_store",
            "inputs": [],
            "attributes": {
              "attributes": {
                "name": {"stringPayload": "SimpleRecipe.output"},
                "type": {"stringPayload": "[Text]"}
              }
            }
          }
        }, {
          "id": 3,
          "operation": {
            "operatorName": "sql.tag_transform",
            "inputs": [{
              "operationResultValue": {
                "operationId": 0,
                "outputName": "out"
              }
            }],
            "attributes": {"attributes": {"rule_name": {"stringPayload": "set_public"}}}
          }
        }, {
          "id": 4,
          "operation": {
            "operatorName": "sql.tag_transform",
            "inputs": [{
              "operationResultValue": {
                "operationId": 2,
                "outputName": "out"
              }
            }],
            "attributes": {"attributes": {"rule_name": {"stringPayload": "set_public"}}}
          }
        }, {
          "id": 5,
          "operation": {
            "operatorName": "arcsjs.particle",
            "inputs": [{
              "operationResultValue": {
                "operationId": 3,
                "outputName": "out"
              }
            }, {
              "operationResultValue": {
                "operationId": 1,
                "outputName": "out"
              }
            }],
            "attributes": {
              "attributes": {
                "name": {"stringPayload": "SimpleRecipe.exfil_particle"},
                "input_0": {"stringPayload": "bar"},
                "input_1": {"stringPayload": "foo"}
              }
            }
          }
        }, {
          "id": 6,
          "operation": {
            "operatorName": "sql.sql_output",
            "inputs": [{
              "operationResultValue": {
                "operationId": 5,
                "outputName": "out"
              }
            }],
            "attributes": {"attributes": {"handle_name": {"stringPayload": "baz"}}}
          }
        }]
      }
    }]
  },
  "frontend": "Recipe2Policy.js",
  "operators": [{"name": "arcsjs.create_store"}, {"name": "sql.tag_transform"},
    {"name": "arcsjs.particle"}, {"name": "sql.sql_output"}]
};