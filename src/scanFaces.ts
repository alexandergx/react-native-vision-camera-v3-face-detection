import { VisionCameraProxy } from 'react-native-vision-camera';
import { Platform } from 'react-native';

import type {
  FaceDetectionOptions,
  Frame,
  ScanFacesResult,
} from './types';

type PluginType = ReturnType<typeof VisionCameraProxy.initFrameProcessorPlugin>;

const plugin: PluginType =
  VisionCameraProxy.initFrameProcessorPlugin('scanFaces');

const LINKING_ERROR =
  `The package 'react-native-vision-camera-v3-face-detection' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export function scanFaces(
  frame: Frame,
  options: FaceDetectionOptions,
): ScanFacesResult {
  'worklet';
  if (plugin == null) throw new Error(LINKING_ERROR);

  // @ts-ignore – VisionCamera’s plugin.call is not typed
  return options ? plugin.call(frame, options) : plugin.call(frame);
}
