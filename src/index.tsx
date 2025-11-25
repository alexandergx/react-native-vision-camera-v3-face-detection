import React, {
  forwardRef,
  type ForwardedRef,
  useMemo,
} from 'react';
import {
  Camera as VisionCamera,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { scanFaces } from './scanFaces';
import type { Frame, CameraTypes, FrameProcessor, ScanFacesResult } from './types';

// local helper hook built on 0.2.x API
function useRunInJS(
  fn: (data: ScanFacesResult) => void,
  deps: React.DependencyList,
) {
  return useMemo(() => {
    const runner = Worklets.createRunInJsFn(fn); // 0.2.x API
    // runner returns a Promise<T>, but from worklet land we don't care
    return (data: ScanFacesResult) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      runner(data);
    };
  }, deps);
}

export const Camera = forwardRef(function Camera(
  props: CameraTypes,
  ref: ForwardedRef<any>,
) {
  const { callback, options, device, ...rest } = props;

  const runOnJS = useRunInJS(
    (data: object): void => {
      callback?.(data);
    },
    [callback],
  );

  const frameProcessor: FrameProcessor = useFrameProcessor(
    (frame: Frame): void => {
      'worklet';
      const data: object = scanFaces(frame, options);
      runOnJS(data); // worklet → JS
    },
    [options, runOnJS],
  );

  if (!device) return null;

  return (
    <VisionCamera
      ref={ref}
      frameProcessor={frameProcessor}
      device={device}
      {...rest}
    />
  );
});

export { scanFaces } from './scanFaces';

export type {
  Frame,
  FrameProcessor,
  FaceDetectionOptions,
  CameraTypes,
  ScanFacesResult,
  FaceBox,
} from './types';
