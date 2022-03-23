/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import * as feeds from '../../Media/FeedRecipes.js';
import * as selector from '../../Media/SelectorRecipes.js';

import * as home from '../../Homescreen/HomescreenRecipes.js';
import * as quagga from '../../Barcode/Quagga/QuaggaRecipes.js';
import * as zxing from '../../Barcode/ZXing/ZXingRecipes.js';
import * as barcode from '../../Barcode/BarcodeDetector/BarcodeDetectorRecipes.js';
import * as holistic from '../../Mediapipe/HolisticRecipes.js';
import * as modelViewer from '../../ModelViewer/ModelViewerRecipes.js';
import * as tesseract from '../../OCR/Tesseract/TesseractRecipes.js';

import * as plants from '../../Goog/PlantsRecipes.js';
import * as trains from '../../Goog/TrainRecipes.js';
import * as poems from '../../Goog/PoemRecipes.js';

import * as hub from '../../Actions/HubModelRecipes.js';
import * as speech from '../../Actions/SpeechRecipes.js';
import {ChoiceDisplayRecipe} from '../../Actions/ChoiceDisplayRecipe.js';
import {ClassifierScrimRecipe} from '../../Actions/ClassifierScrimRecipe.js';
import {WebPageDisplayRecipe} from '../../Actions/WebPageDisplayRecipe.js';
import {JSONDisplay} from '../../Actions/JSONDisplayRecipe.js';
import {BarDisplay} from '../../Actions/BarDisplayRecipe.js';
import {BoxDisplay} from '../../Actions/BoxDisplayRecipe.js';
import {TextDisplay} from '../../Actions/TextDisplayRecipe.js';
import {TranslationDisplay} from '../../Actions/TranslationDisplayRecipe.js';
import {OpenFoodFactsDisplay} from '../../Actions/OpenFoodFactsRecipes.js';
import {WineDisplay} from '../../Actions/WineDisplayRecipe.js';

export const recipes = [
  // environment
  feeds.VideoFeedRecipe,
  feeds.StaticFeedRecipe,
  selector.VideoSelectorRecipe,
  feeds.BasicDisplayRecipe,
  // other
  modelViewer.ModelViewerRecipe,
  home.NewsRecipe,
  home.WeatherForecastRecipe,
  // perception
  hub.HubModelRecipe,
  holistic.HolisticRecipe,
  zxing.ZXing,
  quagga.Quagga,
  barcode.BarcodeDetector,
  tesseract.Tesseract,
  speech.Speech2TextRecipe,
  // meta
  speech.TranslatorRecipe,
  speech.WikiSearchRecipe,
  // displays
  ClassifierScrimRecipe,
  JSONDisplay,
  BarDisplay,
  BoxDisplay,
  TextDisplay,
  TranslationDisplay,
  ChoiceDisplayRecipe,
  WebPageDisplayRecipe,
  plants.PlantInfoDisplay,
  // vertical
  WineDisplay,
  OpenFoodFactsDisplay,
  // demo
  trains.FindTrainTicketsRecipe,
  trains.TrainTicketsDisplayRecipe,
  poems.HaikuPoemRecipe
];

const modelFile = 'lite-model_object_detection_mobile_object_localizer_v1_1_metadata_2.tflite';
const customModelHubRecipe = {
  ...hub.createHubModelRecipe({url: `./Library/RedOwl/models/${modelFile}`}),
  $meta: {
    description: `Object Detector`,
    name: 'Detector (EDL4)',
    group: 'classifier'
  }
};
customModelHubRecipe.Classifier.$inputs.modelKind = 'ObjectDetector';
recipes.push(customModelHubRecipe);