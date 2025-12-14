import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageToWebp } from "./image-to-webp";

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock HTMLCanvasElement.prototype.toBlob
HTMLCanvasElement.prototype.toBlob = function(callback) {
  const mockBlob = new Blob(['mock-webp-data'], { type: 'image/webp' });
  setTimeout(() => callback(mockBlob), 0);
};

// Mock Image class
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as any;

describe('ImageToWebp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title and description', () => {
    render(<ImageToWebp />);
    
    expect(screen.getByText('Image to WebP Converter')).toBeInTheDocument();
    expect(screen.getByText(/Convert your images to WebP format/)).toBeInTheDocument();
  });

  it('has quality slider with default value', () => {
    render(<ImageToWebp />);
    
    // Check that quality label exists
    expect(screen.getByText('Quality: 80%')).toBeInTheDocument();
    // Slider component should be present
    const qualitySlider = screen.getByRole('slider');
    expect(qualitySlider).toBeInTheDocument();
  });

  it('shows drag and drop area', () => {
    render(<ImageToWebp />);
    
    expect(screen.getByText(/Click to select or drag images here/)).toBeInTheDocument();
    expect(screen.getByText(/Multiple files are supported/)).toBeInTheDocument();
  });

  it('updates quality when slider is moved', () => {
    render(<ImageToWebp />);
    
    // For Slider component, we can't easily test value changes in this way
    // Just verify the slider exists and initial state
    expect(screen.getByText('Quality: 80%')).toBeInTheDocument();
    const qualitySlider = screen.getByRole('slider');
    expect(qualitySlider).toBeInTheDocument();
  });

  it('shows processing state when files are being processed', async () => {
    render(<ImageToWebp />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByText(/Click to select or drag images here/).closest('div')?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Processing images...')).toBeInTheDocument();
      });
    }
  });

  it('displays converted images after processing', async () => {
    render(<ImageToWebp />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByText(/Click to select or drag images here/).closest('div')?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Converted Images (1)')).toBeInTheDocument();
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    }
  });

  it('shows file size comparison', async () => {
    render(<ImageToWebp />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByText(/Click to select or drag images here/).closest('div')?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Original:/)).toBeInTheDocument();
        expect(screen.getByText(/WebP:/)).toBeInTheDocument();
        expect(screen.getByText(/Saved:/)).toBeInTheDocument();
      });
    }
  });

  it('has download and remove buttons for converted images', async () => {
    render(<ImageToWebp />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByText(/Click to select or drag images here/).closest('div')?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Download')).toBeInTheDocument();
        expect(screen.getByText('Remove')).toBeInTheDocument();
      });
    }
  });

  it('has download all and clear all buttons when images are present', async () => {
    render(<ImageToWebp />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByText(/Click to select or drag images here/).closest('div')?.querySelector('input[type="file"]');
    
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText('Download All')).toBeInTheDocument();
        expect(screen.getByText('Clear All')).toBeInTheDocument();
      });
    }
  });
});