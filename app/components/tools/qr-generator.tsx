import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function QRGenerator() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const downloadSVG = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.download = "qrcode.svg";
    downloadLink.href = url;
    downloadLink.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground">
          Generate QR codes instantly in your browser. All processing happens client-side - no data is sent to any server.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Customize your QR code settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="text">Text or URL</Label>
              <Input
                id="text"
                type="text"
                placeholder="Enter text or URL"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter any text, URL, or data you want to encode
              </p>
            </div>

            {/* Size Input */}
            <div className="space-y-2">
              <Label htmlFor="size">Size (px): {size}</Label>
              <Input
                id="size"
                type="range"
                min="128"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Adjust the size of the QR code (128-512 pixels)
              </p>
            </div>

            {/* Color Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fgColor">Foreground Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2 pt-4">
              <Label>Download QR Code</Label>
              <div className="flex gap-2">
                <Button onClick={downloadQR} className="flex-1">
                  Download PNG
                </Button>
                <Button onClick={downloadSVG} variant="outline" className="flex-1">
                  Download SVG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Your generated QR code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
              {text ? (
                <QRCodeSVG
                  id="qr-code"
                  value={text}
                  size={Math.min(size, 400)}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="H"
                  includeMargin
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Enter text to generate QR code</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About QR Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            QR (Quick Response) codes are two-dimensional barcodes that can store various types of data,
            including URLs, text, contact information, and more. They can be scanned using smartphone cameras
            or dedicated QR code readers.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Common Uses:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Website URLs for easy mobile access</li>
              <li>Wi-Fi network credentials</li>
              <li>Contact information (vCards)</li>
              <li>Product information and tracking</li>
              <li>Payment information</li>
              <li>Event tickets and check-ins</li>
            </ul>
          </div>
          <p className="text-xs italic">
            All QR code generation is performed locally in your browser using the qrcode.react library.
            No data is transmitted to external servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
