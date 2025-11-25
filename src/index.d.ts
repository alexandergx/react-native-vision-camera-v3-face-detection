import React from 'react';
import type {
  CameraTypes,
  FaceDetectionOptions,
  ScanFacesResult,
  FaceBox,
  ScanTextOptions,
  ScanTextResult,
  OcrTextBox,
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

export declare function scanText(
  frame: Frame,
  options?: ScanTextOptions,
): ScanTextResult;

export type {
  CameraTypes,
  FaceDetectionOptions,
  ScanFacesResult,
  FaceBox,
  ScanTextOptions,
  ScanTextResult,
  OcrTextBox,
};

export type {
  Frame,
  FrameProcessor,
};
