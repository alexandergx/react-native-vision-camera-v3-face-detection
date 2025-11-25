import { Platform } from 'react-native';
import { VisionCameraProxy } from 'react-native-vision-camera';
import type { Frame } from './types';
import type { ScanTextOptions, ScanTextResult } from './types';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('scanText');

const LINKING_ERROR =
  `The plugin 'scanText' from 'react-native-vision-camera-v3-face-detection' doesn't seem to be linked.\n` +
  Platform.select({ ios: "- Did you run 'pod install'?\n", default: '' }) +
  '- Did you rebuild the app after installing the package?\n' +
  '- Are you avoiding Expo Go?\n';

export function scanText(
  frame: Frame,
  options?: ScanTextOptions,
): ScanTextResult {
  'worklet';
  if (plugin == null) {
    throw new Error(LINKING_ERROR);
  }
  // @ts-expect-error frame-processor plugins are untyped at runtime
  return options ? plugin.call(frame, options) : plugin.call(frame);
}
