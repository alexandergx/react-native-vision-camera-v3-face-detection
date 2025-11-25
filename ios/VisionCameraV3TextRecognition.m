#import <Foundation/Foundation.h>

// ML Kit OCR modules
@import MLKitVision;
@import MLKitTextRecognitionCommon;
@import MLKitTextRecognition;          // Latin on-device model via GoogleMLKit/TextRecognition

// VisionCamera bridge
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/VisionCameraProxy.h>
#import <VisionCamera/Frame.h>

@interface VisionCameraV3TextRecognitionPlugin : FrameProcessorPlugin
@property(nonatomic, strong) MLKTextRecognizer *textRecognizer;
@end

@implementation VisionCameraV3TextRecognitionPlugin

- (instancetype)init
{
  self = [super init];
  if (self) {
    // v2 API – create a single recognizer instance
    MLKTextRecognizerOptions *options = [[MLKTextRecognizerOptions alloc] init];
    _textRecognizer = [MLKTextRecognizer textRecognizerWithOptions:options];
  }
  return self;
}

- (id _Nullable)callback:(Frame* _Nonnull)frame
           withArguments:(NSDictionary* _Nullable)arguments
{
  CMSampleBufferRef buffer = frame.buffer;
  UIImageOrientation orientation = frame.orientation;

  // MLKit Vision Image
  MLKVisionImage *image = [[MLKVisionImage alloc] initWithBuffer:buffer];
  image.orientation = orientation;

  // Use the shared recognizer
  MLKTextRecognizer *textRecognizer = self.textRecognizer;

  __block NSMutableArray *output = [NSMutableArray array];
  dispatch_group_t group = dispatch_group_create();
  dispatch_group_enter(group);

  [textRecognizer processImage:image
                    completion:^(MLKText * _Nullable text, NSError * _Nullable error) {

    if (error != nil || text == nil) {
      dispatch_group_leave(group);
      return;
    }

    NSInteger index = 0;

    for (MLKTextBlock *block in text.blocks) {
      for (MLKTextLine *line in block.lines) {
        for (MLKTextElement *element in line.elements) {
          NSMutableDictionary *entry = [NSMutableDictionary dictionary];

          // Text content
          entry[@"text"] = element.text ?: @"";

          // Bounding box
          CGRect rect = element.frame;
          entry[@"left"]   = @(CGRectGetMinX(rect));
          entry[@"top"]    = @(CGRectGetMinY(rect));
          entry[@"right"]  = @(CGRectGetMaxX(rect));
          entry[@"bottom"] = @(CGRectGetMaxY(rect));
          entry[@"width"]  = @(CGRectGetWidth(rect));
          entry[@"height"] = @(CGRectGetHeight(rect));

          // Corner points
          NSMutableArray *points = [NSMutableArray array];
          for (NSValue *val in element.cornerPoints) {
            CGPoint p = [val CGPointValue];
            [points addObject:@{ @"x": @(p.x), @"y": @(p.y) }];
          }
          entry[@"cornerPoints"] = points;

          // Add to array
          [output addObject:entry];
          index++;
        }
      }
    }

    dispatch_group_leave(group);
  }];

  // VisionCamera requires synchronous return
  dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
  return output;
}

VISION_EXPORT_FRAME_PROCESSOR(VisionCameraV3TextRecognitionPlugin, scanText)

@end
