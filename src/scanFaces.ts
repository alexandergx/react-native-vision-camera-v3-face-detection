// src/scanFaces.ts

import type {
  FaceDetectionOptions,
  Frame,
  ScanFacesResult,
} from './types';

import { VisionCameraProxy } from 'react-native-vision-camera';
import { Platform } from 'react-native';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('scanFaces');

const LINKING_ERROR =
  `The package 'react-native-vision-camera-v3-face-detection' doesn't seem to be linked.\n\n` +
  Platform.select({ ios: "- Run 'pod install'\n", default: '' }) +
  '- Rebuild the app after installing the package\n' +
  '- Do not use Expo Go\n';

export function scanFaces(
  frame: Frame,
  options?: FaceDetectionOptions
): ScanFacesResult {
  'worklet';

  if (plugin == null) throw new Error(LINKING_ERROR);

  // @ts-ignore – plugin.call is provided by native C++ frame processor
  return options ? plugin.call(frame, options) : plugin.call(frame);
}
