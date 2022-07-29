/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../../arcs-import.js';
const log = logFactory(true, 'TensorFlowService', 'coral');
const classifiers = {};
export const Resources = {};
globalThis.resources = Resources;
export class TensorFlowService  {
  // linkage with Particles
  static async receive({msg, data}) {
    log('receive', msg, data);
    const TensorFlow = await this.requireTensorFlow();
    if (TensorFlow) {
      if (this[msg]) {
        return this[msg](data);
      } else {
        log(`no handler for "${msg}"`);
      }
    }
  }
  static async requireTensorFlow() {
    let tensorFlow = globalThis.tf;
    if (!tensorFlow) {
      const {TensorFlow} = await import(`./tensorflowjs-import.js`)
      tensorFlow = TensorFlow;
    }
    return tensorFlow;
  }
  //
  //
  //
  static async requireCanvasAndModel(image, modelKind, modelUrl) {
    const canvasResource = Resources[image?.canvas] ?? ImageJunk.loadImage(image?.url);
    if (canvasResource) {
      // get values that resolve to dependencies
      const tasks = [
        canvasResource,
        this.requireModel(modelKind, modelUrl),
      ];
      // wait for dependencies (in parallel)
      const [canvas, model] = await Promise.all(tasks);
      return {canvas, model};
    }
    return {};
  }
  static async invokeModel({modelKind, modelUrl, imageRef}) {
    const {canvas, model} = await this.requireCanvasAndModel(imageRef, modelKind, modelUrl);
    if (canvas && model) {
      log('invokeModel', {imageRef, modelUrl});
      // if dependencies are satisfied
      if (model && canvas && canvas.width && canvas.height) {
        // perform the classification
        return await model.invoke(canvas);
      }
    }
  }
  static async toBinaryMask({segmentation}) {
    const coloredPartImage = await bodySegmentation.toBinaryMask(segmentation);
    return this.drawMask(coloredPartImage);
  }
  static async toColoredMask({segmentation}) {
    const coloredPartImage = await bodySegmentation.toColoredMask(
        segmentation,
        bodySegmentation.bodyPixMaskValueToRainbowColor,
        {r: 255, g: 255, b: 255, a: 255}
    );
    this.drawMask(coloredPartImage);
    return handle;
  }
  static async drawMask(coloredPartImage) {
    if (!this.segmenterCanvas) {
      this.segmenterCanvas = ThreejsService.allocateCanvas();
    }
    const handle = await this.segmenterCanvas;
    const canvas = Resources[handle];
    const img = new Image();
    img.width = 640; //canvas.width;
    img.height = 480; //canvas.height;
    bodySegmentation.drawMask(canvas, img, coloredPartImage, 0.7, 0, false);
    return handle;
  }
  //
  //
  //
  static async toolClassify({modelKind, modelUrl, imageRef}) {
    const canvas = Resources[imageRef?.canvas] ?? ImageJunk.loadImage(imageRef);
    if (canvas) {
      log('toolClassify', {imageRef, modelUrl});
      // start asynchronous tasks to marshal dependencies
      const tasks = [
        this.requireModel(modelKind, modelUrl),
        canvas
      ];
      // wait for tasks to complete (in parallel)
      const [tool, image] = await Promise.all(tasks);
      // if dependencies are satisfied
      if (tool && image && image.width && image.height) {
        // perform the classification
        const classes = await tool.classify(image);
        // send back processed results
        return this.getResultTranche(classes);
      }
    }
  }
  static async requireModel(kind, modelUrl) {
    const key = `${kind}:${modelUrl}`;
    if (!classifiers[key]) {
      classifiers[key] = this.loadModel(kind, modelUrl);
    }
    return classifiers[key];
  }
  static async loadModel(kind, modelUrl) {
    log.groupCollapsed(`Model Loader Messages`);
    log(`loading model... [${modelUrl}]`);
    await import(modelUrl);
    let classifierPromise;
    switch (kind) {
      case 'bodySegmentation': {
        const {bodySegmentation} = globalThis;
        const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
        const segmenterConfig = {
          runtime: 'tfjs', //'mediapipe'
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
          modelType: 'general'
        };
        classifierPromise = new Promise(async resolve => {
          const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
          const tool = {
            segmenter,
            invoke: canvas => segmenter.segmentPeople(canvas)
          };
          log(kind, tool);
          resolve(tool);
        });
      }
        break;
        // case 'faceLandmarksDetection': { }
        // break;
      default: {
        const tool = globalThis.mobilenet;
        log(kind, tool);
        classifierPromise = tool?.load();
      }
        break;
    }
    console.time('tfjs-load');
    await classifierPromise;
    console.timeEnd('tfjs-load');
    log.groupEnd();
    return classifierPromise;
  }
  static async getResultTranche(classes) {
    const results = classes?.slice(0, 3);
    log('classification complete', results);
    const output = results?.map(cls => ({
      displayName: cls.displayName ?? cls.className,
      score: cls.probability
    }));
    const result = output.shift();
    // if (result?.score > 0.35) {
    //   outputText = result.displayName;
    // }
    return output;
  }
  static async removeModel(kind, modelUrl) {
    const key = `${kind}:${modelUrl}`;
    let classifier = classifiers[key];
    if (classifier) {
      await classifier.cleanUp();
      classifiers[key] = null;
    }
  }
}
class ImageJunk {
  static async loadImage(src) {
    return src && new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      setTimeout(() => resolve(img), 3000);
      img.src = src;
    });
  }
}