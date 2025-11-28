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

  // These logs run on the **worklet** runtime
  // and should show up in your JS console.
  if (plugin == null) {
    throw new Error(LINKING_ERROR);
  }

  // @ts-expect-error frame-processor plugins are untyped at runtime
  const raw = options ? plugin.call(frame, options) : plugin.call(frame);

  // If raw is an array from native, map to Record<string, OcrTextBox>
  const result: any = {};
  if (Array.isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const item = raw[i];
      result[String(i)] = item;
    }
  } else if (raw && typeof raw === 'object') {
    // already an object – just pass through
    Object.assign(result, raw);
  }

  return result as ScanTextResult;
}
