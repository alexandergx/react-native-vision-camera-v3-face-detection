#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

// ML Kit OCR modules
@import MLKitVision;
@import MLKitTextRecognition;
@import MLKitTextRecognitionCommon;

// VisionCamera bridge
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>

@interface VisionCameraV3TextRecognitionPlugin : FrameProcessorPlugin
@end

@implementation VisionCameraV3TextRecognitionPlugin

- (id _Nullable)callback:(Frame* _Nonnull)frame
           withArguments:(NSDictionary* _Nullable)arguments
{
  NSLog(@"[OCR] scanText callback invoked!!! frame=%@ args=%@", frame, arguments);

  CMSampleBufferRef buffer = frame.buffer;
  if (buffer == nil) {
    NSLog(@"[OCR] ERROR: frame.buffer is nil");
    return @{ @"debug": @"buffer_nil" };
  }

  CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(buffer);
  if (imageBuffer == nil) {
    NSLog(@"[OCR] ERROR: imageBuffer is nil");
    return @{ @"debug": @"image_buffer_nil" };
  }

  size_t width = CVPixelBufferGetWidth(imageBuffer);
  size_t height = CVPixelBufferGetHeight(imageBuffer);
  OSType pixelFormat = CVPixelBufferGetPixelFormatType(imageBuffer);
  NSLog(@"[OCR] CVPixelBuffer w=%zu h=%zu format=0x%08x",
        width, height, (unsigned int)pixelFormat);

  // Mirror the working Swift example: VisionImage(buffer:)
  MLKVisionImage *visionImage = [[MLKVisionImage alloc] initWithBuffer:buffer];

  // The Swift plugin hard-codes .up; do the same for now
  visionImage.orientation = UIImageOrientationUp;

  NSError *error = nil;
  MLKTextRecognizer *recognizer = [MLKTextRecognizer textRecognizer];
  MLKText *result = [recognizer resultsInImage:visionImage error:&error];

  if (error != nil) {
    NSLog(@"[OCR] ERROR from MLKit: %@", error);
    return @{
      @"debug": [NSString stringWithFormat:@"mlkit_error:%@", error.localizedDescription ?: @"unknown"]
    };
  }

  if (result == nil) {
    NSLog(@"[OCR] result == nil (no error)!!! recognizer=%@", recognizer);
    return @{ @"debug": @"result_nil" };
  }

  NSLog(@"[OCR] fullText=\"%@\" !!! blocks=%lu",
        result.text,
        (unsigned long)result.blocks.count);

  if (result.blocks.count == 0) {
    NSLog(@"[OCR] No text blocks!!!");
    return @{
      @"result": @{
        @"text": result.text ?: @"",
        @"blocks": @[],
        @"debug": @"no_blocks"
      }
    };
  }

  // Build a nested structure similar to the Swift implementation
  NSMutableArray *blockArray = [NSMutableArray array];

  for (MLKTextBlock *block in result.blocks) {
    NSMutableArray *lines = [NSMutableArray array];

    for (MLKTextLine *line in block.lines) {
      NSMutableArray *elements = [NSMutableArray array];

      for (MLKTextElement *el in line.elements) {
        CGRect er = el.frame;
        NSMutableArray *cornerPoints = [NSMutableArray array];
        for (NSValue *val in el.cornerPoints) {
          CGPoint p = [val CGPointValue];
          [cornerPoints addObject:@{ @"x": @(p.x), @"y": @(p.y) }];
        }

        [elements addObject:@{
          @"text": el.text ?: @"",
          @"frame": @{
            @"x": @(CGRectGetMinX(er)),
            @"y": @(CGRectGetMinY(er)),
            @"width": @(CGRectGetWidth(er)),
            @"height": @(CGRectGetHeight(er))
          },
          @"cornerPoints": cornerPoints,
        }];
      }

      CGRect lr = line.frame;
      [lines addObject:@{
        @"text": line.text ?: @"",
        @"frame": @{
          @"x": @(CGRectGetMinX(lr)),
          @"y": @(CGRectGetMinY(lr)),
          @"width": @(CGRectGetWidth(lr)),
          @"height": @(CGRectGetHeight(lr))
        },
        @"elements": elements,
      }];
    }

    CGRect br = block.frame;
    [blockArray addObject:@{
      @"text": block.text ?: @"",
      @"frame": @{
        @"x": @(CGRectGetMinX(br)),
        @"y": @(CGRectGetMinY(br)),
        @"width": @(CGRectGetWidth(br)),
        @"height": @(CGRectGetHeight(br))
      },
      @"lines": lines,
    }];
  }

  return @{
    @"result": @{
      @"text": result.text ?: @"",
      @"blocks": blockArray,
    }
  };
}

VISION_EXPORT_FRAME_PROCESSOR(VisionCameraV3TextRecognitionPlugin, scanText)

@end
