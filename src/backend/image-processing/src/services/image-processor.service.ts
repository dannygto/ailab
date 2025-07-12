import * as sharp from 'sharp';
import * as Jimp from 'jimp';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  format?: 'jpeg' | 'png' | 'webp' | 'gif';
  quality?: number;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    sharpen?: number;
  };
  effects?: {
    grayscale?: boolean;
    sepia?: boolean;
    invert?: boolean;
    flip?: boolean;
    flop?: boolean;
  };
}

export interface ImageAnalysisResult {
  width: number;
  height: number;
  format: string;
  size: number;
  dominantColors: string[];
  histogram: {
    red: number[];
    green: number[];
    blue: number[];
  };
  metadata: {
    exif?: any;
    iptc?: any;
    xmp?: any;
  };
}

export interface ObjectDetectionResult {
  objects: Array<{
    label: string;
    confidence: number;
    bbox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  imageWithBoxes?: Buffer;
}

export class ImageProcessorService {
  private uploadDir: string;
  private processedDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.processedDir = process.env.PROCESSED_DIR || 'processed';
    
    // 确保目录存在
    fs.ensureDirSync(this.uploadDir);
    fs.ensureDirSync(this.processedDir);
  }

  /**
   * 处理图像
   */
  async processImage(
    imageBuffer: Buffer,
    options: ImageProcessingOptions,
    outputFormat?: string
  ): Promise<Buffer> {
    try {
      logger.info('Processing image with options:', options);

      let processedImage = sharp(imageBuffer);

      // 应用调整大小
      if (options.resize) {
        processedImage = processedImage.resize(options.resize);
      }

      // 应用滤镜
      if (options.filters) {
        if (options.filters.brightness !== undefined) {
          processedImage = processedImage.modulate({
            brightness: options.filters.brightness,
          });
        }
        if (options.filters.contrast !== undefined) {
          processedImage = processedImage.modulate({
            contrast: options.filters.contrast,
          });
        }
        if (options.filters.saturation !== undefined) {
          processedImage = processedImage.modulate({
            saturation: options.filters.saturation,
          });
        }
        if (options.filters.blur !== undefined) {
          processedImage = processedImage.blur(options.filters.blur);
        }
        if (options.filters.sharpen !== undefined) {
          processedImage = processedImage.sharpen(options.filters.sharpen);
        }
      }

      // 应用特效
      if (options.effects) {
        if (options.effects.grayscale) {
          processedImage = processedImage.grayscale();
        }
        if (options.effects.sepia) {
          processedImage = processedImage.tint({ r: 112, g: 66, b: 20 });
        }
        if (options.effects.invert) {
          processedImage = processedImage.negate();
        }
        if (options.effects.flip) {
          processedImage = processedImage.flip();
        }
        if (options.effects.flop) {
          processedImage = processedImage.flop();
        }
      }

      // 设置输出格式和质量
      const format = outputFormat || options.format || 'jpeg';
      const quality = options.quality || 80;

      switch (format) {
        case 'jpeg':
          processedImage = processedImage.jpeg({ quality });
          break;
        case 'png':
          processedImage = processedImage.png();
          break;
        case 'webp':
          processedImage = processedImage.webp({ quality });
          break;
        case 'gif':
          processedImage = processedImage.gif();
          break;
      }

      const result = await processedImage.toBuffer();
      logger.info('Image processing completed');
      
      return result;
    } catch (error) {
      logger.error('Image processing failed:', error);
      throw new Error('图像处理失败');
    }
  }

  /**
   * 分析图像
   */
  async analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysisResult> {
    try {
      logger.info('Analyzing image');

      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      // 获取图像尺寸
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const format = metadata.format || 'unknown';
      const size = imageBuffer.length;

      // 生成直方图
      const histogram = await this.generateHistogram(imageBuffer);

      // 提取主要颜色
      const dominantColors = await this.extractDominantColors(imageBuffer);

      // 提取EXIF等元数据
      const exifData = metadata.exif ? await this.parseExif(metadata.exif) : undefined;

      const result: ImageAnalysisResult = {
        width,
        height,
        format,
        size,
        dominantColors,
        histogram,
        metadata: {
          exif: exifData,
        },
      };

      logger.info('Image analysis completed');
      return result;
    } catch (error) {
      logger.error('Image analysis failed:', error);
      throw new Error('图像分析失败');
    }
  }

  /**
   * 生成直方图
   */
  private async generateHistogram(imageBuffer: Buffer): Promise<{
    red: number[];
    green: number[];
    blue: number[];
  }> {
    try {
      const image = await Jimp.read(imageBuffer);
      const width = image.getWidth();
      const height = image.getHeight();

      const redHistogram = new Array(256).fill(0);
      const greenHistogram = new Array(256).fill(0);
      const blueHistogram = new Array(256).fill(0);

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const color = image.getPixelColor(x, y);
          const rgba = Jimp.intToRGBA(color);
          
          redHistogram[rgba.r]++;
          greenHistogram[rgba.g]++;
          blueHistogram[rgba.b]++;
        }
      }

      return {
        red: redHistogram,
        green: greenHistogram,
        blue: blueHistogram,
      };
    } catch (error) {
      logger.error('Failed to generate histogram:', error);
      return {
        red: new Array(256).fill(0),
        green: new Array(256).fill(0),
        blue: new Array(256).fill(0),
      };
    }
  }

  /**
   * 提取主要颜色
   */
  private async extractDominantColors(imageBuffer: Buffer): Promise<string[]> {
    try {
      const image = await Jimp.read(imageBuffer);
      const width = image.getWidth();
      const height = image.getHeight();

      // 简化图像以加快处理速度
      const sampleImage = image.resize(50, 50);
      const colorMap = new Map<string, number>();

      for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
          const color = sampleImage.getPixelColor(x, y);
          const rgba = Jimp.intToRGBA(color);
          
          // 将颜色量化到16个级别
          const quantizedColor = `#${Math.floor(rgba.r / 16) * 16}${Math.floor(rgba.g / 16) * 16}${Math.floor(rgba.b / 16) * 16}`;
          
          colorMap.set(quantizedColor, (colorMap.get(quantizedColor) || 0) + 1);
        }
      }

      // 按出现频率排序并返回前5个颜色
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => color);

      return sortedColors;
    } catch (error) {
      logger.error('Failed to extract dominant colors:', error);
      return ['#000000', '#FFFFFF', '#808080'];
    }
  }

  /**
   * 解析EXIF数据
   */
  private async parseExif(exifBuffer: Buffer): Promise<any> {
    try {
      // 这里可以使用exif-reader等库来解析EXIF数据
      // 目前返回基本信息
      return {
        size: exifBuffer.length,
        hasData: exifBuffer.length > 0,
      };
    } catch (error) {
      logger.error('Failed to parse EXIF data:', error);
      return null;
    }
  }

  /**
   * 目标检测（模拟实现）
   */
  async detectObjects(imageBuffer: Buffer): Promise<ObjectDetectionResult> {
    try {
      logger.info('Detecting objects in image');

      // 这里应该集成实际的AI模型进行目标检测
      // 目前返回模拟结果
      const mockObjects = [
        {
          label: 'person',
          confidence: 0.95,
          bbox: { x: 100, y: 50, width: 200, height: 400 },
        },
        {
          label: 'car',
          confidence: 0.87,
          bbox: { x: 300, y: 200, width: 150, height: 100 },
        },
      ];

      // 在图像上绘制边界框
      const imageWithBoxes = await this.drawBoundingBoxes(imageBuffer, mockObjects);

      const result: ObjectDetectionResult = {
        objects: mockObjects,
        imageWithBoxes,
      };

      logger.info('Object detection completed');
      return result;
    } catch (error) {
      logger.error('Object detection failed:', error);
      throw new Error('目标检测失败');
    }
  }

  /**
   * 在图像上绘制边界框
   */
  private async drawBoundingBoxes(
    imageBuffer: Buffer,
    objects: Array<{ label: string; confidence: number; bbox: any }>
  ): Promise<Buffer> {
    try {
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      
      // 加载图像
      const image = await loadImage(imageBuffer);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // 绘制边界框
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00FF00';

      for (const obj of objects) {
        const { x, y, width, height } = obj.bbox;
        
        // 绘制边界框
        ctx.strokeRect(x, y, width, height);
        
        // 绘制标签
        const label = `${obj.label} ${(obj.confidence * 100).toFixed(1)}%`;
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x, y - 20, textWidth + 10, 20);
        
        ctx.fillStyle = '#000000';
        ctx.fillText(label, x + 5, y - 5);
      }

      return canvas.toBuffer('image/jpeg');
    } catch (error) {
      logger.error('Failed to draw bounding boxes:', error);
      return imageBuffer;
    }
  }

  /**
   * 图像分割（模拟实现）
   */
  async segmentImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      logger.info('Segmenting image');

      // 这里应该集成实际的图像分割模型
      // 目前返回原图像
      const result = await sharp(imageBuffer)
        .jpeg({ quality: 80 })
        .toBuffer();

      logger.info('Image segmentation completed');
      return result;
    } catch (error) {
      logger.error('Image segmentation failed:', error);
      throw new Error('图像分割失败');
    }
  }

  /**
   * 图像增强
   */
  async enhanceImage(imageBuffer: Buffer, enhancementType: string): Promise<Buffer> {
    try {
      logger.info(`Enhancing image with type: ${enhancementType}`);

      let enhancedImage = sharp(imageBuffer);

      switch (enhancementType) {
        case 'auto_contrast':
          enhancedImage = enhancedImage.normalize();
          break;
        case 'sharpen':
          enhancedImage = enhancedImage.sharpen();
          break;
        case 'denoise':
          enhancedImage = enhancedImage.median(3);
          break;
        case 'hdr':
          enhancedImage = enhancedImage.modulate({
            brightness: 1.1,
            contrast: 1.2,
            saturation: 1.1,
          });
          break;
        default:
          // 默认增强
          enhancedImage = enhancedImage
            .normalize()
            .sharpen()
            .modulate({
              brightness: 1.05,
              contrast: 1.1,
            });
      }

      const result = await enhancedImage.jpeg({ quality: 90 }).toBuffer();
      logger.info('Image enhancement completed');
      
      return result;
    } catch (error) {
      logger.error('Image enhancement failed:', error);
      throw new Error('图像增强失败');
    }
  }

  /**
   * 批量处理图像
   */
  async batchProcessImages(
    imageBuffers: Buffer[],
    options: ImageProcessingOptions
  ): Promise<Buffer[]> {
    try {
      logger.info(`Batch processing ${imageBuffers.length} images`);

      const promises = imageBuffers.map(buffer => 
        this.processImage(buffer, options)
      );

      const results = await Promise.all(promises);
      logger.info('Batch processing completed');
      
      return results;
    } catch (error) {
      logger.error('Batch processing failed:', error);
      throw new Error('批量图像处理失败');
    }
  }

  /**
   * 保存处理后的图像
   */
  async saveProcessedImage(
    imageBuffer: Buffer,
    filename: string,
    format: string = 'jpeg'
  ): Promise<string> {
    try {
      const fileId = uuidv4();
      const extension = format === 'jpeg' ? 'jpg' : format;
      const filepath = path.join(this.processedDir, `${fileId}.${extension}`);

      await fs.writeFile(filepath, imageBuffer);
      logger.info(`Processed image saved: ${filepath}`);
      
      return filepath;
    } catch (error) {
      logger.error('Failed to save processed image:', error);
      throw new Error('保存处理后的图像失败');
    }
  }

  /**
   * 获取图像统计信息
   */
  async getImageStats(imageBuffer: Buffer): Promise<{
    size: number;
    format: string;
    dimensions: { width: number; height: number };
    aspectRatio: number;
    fileSize: string;
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      const aspectRatio = width / height;

      const fileSize = this.formatFileSize(imageBuffer.length);

      return {
        size: imageBuffer.length,
        format: metadata.format || 'unknown',
        dimensions: { width, height },
        aspectRatio,
        fileSize,
      };
    } catch (error) {
      logger.error('Failed to get image stats:', error);
      throw new Error('获取图像统计信息失败');
    }
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
} 