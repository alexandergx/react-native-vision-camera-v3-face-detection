import React from 'react';
import type {
  CameraTypes,
  FaceDetectionOptions,
  ScanFacesResult,
  FaceBox,
} from './types';
import type {
  Frame,
  FrameProcessor,
} from 'react-native-vision-camera';

export declare const Camera: React.ForwardRefExoticComponent<
  CameraTypes & React.RefAttributes<any>
>;

export declare function scanFaces(
  frame: Frame,
  options: FaceDetectionOptions,
): ScanFacesResult;

export type {
  CameraTypes,
  FaceDetectionOptions,
  ScanFacesResult,
  FaceBox,
};

export type {
  Frame,
  FrameProcessor,
};

