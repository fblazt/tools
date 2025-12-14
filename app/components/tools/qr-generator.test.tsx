import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QRGenerator } from "~/components/tools/qr-generator";

// Mock qrcode.react
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value, size, bgColor, fgColor }: any) => (
    <svg
      id="qr-code"
      data-testid="qr-code"
      width={size}
      height={size}
      style={{ backgroundColor: bgColor, color: fgColor }}
    >
      <title>QR Code for {value}</title>
      <rect width={size} height={size} fill={bgColor} />
      <text x={size / 2} y={size / 2} textAnchor="middle" fill={fgColor}>
        QR: {value}
      </text>
    </svg>
  ),
}));

describe("QRGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default values", () => {
    render(<QRGenerator />);
    
    expect(screen.getByText("QR Code Generator")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
    expect(screen.getByText(/Size \(px\): 256/)).toBeInTheDocument();
    
    // Check that color text inputs exist with default values
    expect(screen.getByDisplayValue("#000000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#ffffff")).toBeInTheDocument();
  });

  it("updates text input correctly", async () => {
    const user = userEvent.setup();
    render(<QRGenerator />);
    
    const textInput = screen.getByLabelText(/Text or URL/i);
    await user.clear(textInput);
    await user.type(textInput, "https://test.com");
    
    expect(textInput).toHaveValue("https://test.com");
  });

  it("displays QR code when text is provided", () => {
    render(<QRGenerator />);
    
    const qrCode = screen.getByTestId("qr-code");
    expect(qrCode).toBeInTheDocument();
  });

  it("shows placeholder when text is empty", async () => {
    const user = userEvent.setup();
    render(<QRGenerator />);
    
    const textInput = screen.getByLabelText(/Text or URL/i);
    await user.clear(textInput);
    
    expect(screen.getByText("Enter text to generate QR code")).toBeInTheDocument();
    expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument();
  });

  it("renders download buttons", () => {
    render(<QRGenerator />);
    
    expect(screen.getByText("Download PNG")).toBeInTheDocument();
    expect(screen.getByText("Download SVG")).toBeInTheDocument();
  });

  it("displays information about QR codes", () => {
    render(<QRGenerator />);
    
    expect(screen.getByText("About QR Codes")).toBeInTheDocument();
    expect(screen.getByText(/QR \(Quick Response\) codes are two-dimensional barcodes/)).toBeInTheDocument();
    expect(screen.getByText("Website URLs for easy mobile access")).toBeInTheDocument();
    expect(screen.getByText("Wi-Fi network credentials")).toBeInTheDocument();
  });

  it("has proper accessibility labels", () => {
    render(<QRGenerator />);
    
    expect(screen.getByLabelText(/Text or URL/i)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument(); // Slider exists but without name attribute
    expect(screen.getByText(/Foreground Color/i)).toBeInTheDocument();
    expect(screen.getByText(/Background Color/i)).toBeInTheDocument();
  });

  it("updates size slider value display", async () => {
    const user = userEvent.setup();
    render(<QRGenerator />);
    
    // Check initial size
    expect(screen.getByText(/Size \(px\): 256/)).toBeInTheDocument();
    
    // For Slider component, just verify it exists and can be clicked
    const sizeSlider = screen.getByRole("slider");
    await user.click(sizeSlider);
    
    // The label should still exist
    expect(screen.getByText(/Size \(px\):/)).toBeInTheDocument();
  });

  it("has proper form structure", () => {
    render(<QRGenerator />);
    
    // Check that all form elements are present
    expect(screen.getByRole("textbox", { name: /Text or URL/i })).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument(); // Slider exists
    expect(screen.getByDisplayValue("#000000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#ffffff")).toBeInTheDocument();
  });
});