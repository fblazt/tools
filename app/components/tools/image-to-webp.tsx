import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface ConvertedImage {
  id: string;
  originalName: string;
  originalSize: number;
  webpUrl: string;
  webpSize: number;
  quality: number;
}

export function ImageToWebp() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.webpUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const convertToWebp = useCallback(async (file: File): Promise<ConvertedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const srcUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(srcUrl);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }

            const webpUrl = URL.createObjectURL(blob);
            resolve({
              id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              originalName: file.name,
              originalSize: file.size,
              webpUrl,
              webpSize: blob.size,
              quality,
            });
          },
          'image/webp',
          quality / 100
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(srcUrl);
        reject(new Error('Failed to load image'));
      };
      img.src = srcUrl;
    });
  }, [quality]);

  const handleFiles = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE
    );

    try {
      const convertedImages = await Promise.all(
        imageFiles.map(file => convertToWebp(file))
      );
      setImages(prev => [...prev, ...convertedImages]);
    } catch (error) {
      console.error('Error converting images:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [convertToWebp]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const downloadImage = (image: ConvertedImage) => {
    const a = document.createElement('a');
    a.href = image.webpUrl;
    a.download = image.originalName.replace(/\.[^/.]+$/, '.webp');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllImages = () => {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 100);
    });
  };

  const clearImages = () => {
    images.forEach(image => URL.revokeObjectURL(image.webpUrl));
    setImages([]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) URL.revokeObjectURL(image.webpUrl);
      return prev.filter(img => img.id !== id);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Image to WebP Converter</h1>
        <p className="text-muted-foreground">
          Convert images to modern WebP format for smaller file sizes with zero server uploads.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Drag and drop images or click to select files. Supports JPEG, PNG, GIF, and BMP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quality">Quality: {quality}%</Label>
            <Slider
              id="quality"
              min={10}
              max={100}
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              className="w-full"
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragging ? 'Drop images here' : 'Click to select or drag images here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Multiple files are supported
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Processing images...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Converted Images ({images.length})</CardTitle>
                <CardDescription>
                  Download your converted WebP images
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadAllImages} variant="outline">
                  Download All
                </Button>
                <Button onClick={clearImages} variant="destructive">
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={image.webpUrl}
                      alt={image.originalName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate">{image.originalName}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Original: {formatFileSize(image.originalSize)}</div>
                      <div>WebP: {formatFileSize(image.webpSize)}</div>
                      <div className={`font-medium ${image.webpSize < image.originalSize ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {image.webpSize < image.originalSize
                          ? `Saved: ${formatFileSize(image.originalSize - image.webpSize)} (${Math.round((1 - image.webpSize / image.originalSize) * 100)}%)`
                          : `Increased: ${formatFileSize(image.webpSize - image.originalSize)} (+${Math.round((image.webpSize / image.originalSize - 1) * 100)}%)`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => downloadImage(image)}
                      className="flex-1"
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeImage(image.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About WebP Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            WebP is a modern image format developed by Google that provides superior compression and quality
            characteristics compared to traditional formats like JPEG and PNG. It supports both lossy and lossless
            compression, as well as alpha transparency and animation.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Key Benefits:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Smaller file sizes with equivalent quality</li>
              <li>Better compression for web images</li>
              <li>Supports transparency like PNG</li>
              <li>Supports animation like GIF</li>
              <li>Widely supported by modern browsers</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Common Use Cases:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Website optimization for faster loading</li>
              <li>Web application image assets</li>
              <li>E-commerce product images</li>
              <li>Social media content</li>
              <li>Email newsletters and marketing</li>
            </ul>
          </div>
          <p className="text-xs italic flex items-center gap-2">
            WebP conversion is performed locally in your browser. Your images are never uploaded to external servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
