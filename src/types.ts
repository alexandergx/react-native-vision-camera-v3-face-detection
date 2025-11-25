export type {
  Frame,
  FrameProcessorPlugin,
  FrameProcessor,
} from 'react-native-vision-camera';
import type { CameraProps, CameraDevice } from 'react-native-vision-camera';

export interface FaceDetectionOptions {
  performanceMode?: 'fast' | 'accurate';
  landmarkMode?: 'none' | 'all';
  contourMode?: 'none' | 'all';
  classificationMode?: 'none' | 'all';
  minFaceSize?: number;
  trackingEnabled?: boolean;
}

export type CameraTypes = {
  callback?: (data: ScanFacesResult | object) => void;
  options: FaceDetectionOptions;
  device: CameraDevice;
} & CameraProps;

/**
 * Shape of the result you get back from scanFaces.
 * (Right now it’s basically an index→face map, keep it loose if you want.)
 */
export interface FaceBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

export type ScanFacesResult = Record<string, FaceBox>;
