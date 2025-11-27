import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JWTDecoder } from "~/components/tools/jwt-decoder";

// Mock Date.now for consistent expiration testing
const mockDateNow = vi.fn();
Object.defineProperty(Date, 'now', {
  value: mockDateNow,
  writable: true,
});

describe("JWTDecoder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDateNow.mockReturnValue(1609459200000); // 2021-01-01 00:00:00 UTC
    
    // Mock clipboard before each test
    const mockClipboard = {
      writeText: vi.fn(),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
  });

  // Helper function to create a valid JWT token
  const createValidJWT = (payload: any = {}) => {
    const header = { alg: "HS256", typ: "JWT" };
    const defaultPayload = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1609459200,
      ...payload,
    };
    
    const headerEncoded = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_");
    const payloadEncoded = btoa(JSON.stringify(defaultPayload)).replace(/\+/g, "-").replace(/\//g, "_");
    const signature = "signature";
    
    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  };

  it("renders with default values", () => {
    render(<JWTDecoder />);
    
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByLabelText("JWT Token")).toBeInTheDocument();
    expect(screen.getByText("Decode JWT")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/)).toBeInTheDocument();
  });

  it("does not show results when input is empty", () => {
    render(<JWTDecoder />);
    
    expect(screen.queryByText("Header")).not.toBeInTheDocument();
    expect(screen.queryByText("Payload")).not.toBeInTheDocument();
    expect(screen.queryByText("Signature")).not.toBeInTheDocument();
  });

  it("decodes a valid JWT token correctly", async () => {
    const user = userEvent.setup();
    const validJWT = createValidJWT();
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, validJWT);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    // Check that results are displayed
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Payload")).toBeInTheDocument();
    expect(screen.getByText("Signature")).toBeInTheDocument();
    
    // Check header content
    expect(screen.getByText(/"alg": "HS256"/)).toBeInTheDocument();
    expect(screen.getByText(/"typ": "JWT"/)).toBeInTheDocument();
    
    // Check payload content
    expect(screen.getByText(/"sub": "1234567890"/)).toBeInTheDocument();
    expect(screen.getByText(/"name": "John Doe"/)).toBeInTheDocument();
    
    // Check signature
    expect(screen.getByText("signature")).toBeInTheDocument();
  });

  it("handles invalid JWT format", async () => {
    const user = userEvent.setup();
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, "invalid.jwt");
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Payload")).toBeInTheDocument();
    expect(screen.getAllByText("Invalid JWT format. Expected 3 parts separated by dots.")).toHaveLength(2);
    expect(screen.queryByText("Signature")).not.toBeInTheDocument();
  });

  it("handles malformed JWT with invalid base64", async () => {
    const user = userEvent.setup();
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, "invalid.base64.token");
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Payload")).toBeInTheDocument();
    expect(screen.getAllByText(/not valid JSON/)).toHaveLength(2);
    expect(screen.queryByText("Signature")).not.toBeInTheDocument();
  });

  it("clears results when input is cleared and decode is clicked", async () => {
    const user = userEvent.setup();
    const validJWT = createValidJWT();
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, validJWT);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    // Results should be visible
    expect(screen.getByText("Header")).toBeInTheDocument();
    
    // Clear input and decode again
    await user.clear(textarea);
    await user.click(decodeButton);
    
    // Results should be hidden
    expect(screen.queryByText("Header")).not.toBeInTheDocument();
    expect(screen.queryByText("Payload")).not.toBeInTheDocument();
    expect(screen.queryByText("Signature")).not.toBeInTheDocument();
  });

  it("shows expiration status for valid token", async () => {
    const user = userEvent.setup();
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const validJWT = createValidJWT({ exp: futureTime });
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, validJWT);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    expect(screen.getByText("Token Status")).toBeInTheDocument();
    expect(screen.getByText(/Valid for \d+ minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Valid for \d+ minutes/)).toHaveClass("text-green-600");
  });

  it("shows expiration status for expired token", async () => {
    const user = userEvent.setup();
    const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const validJWT = createValidJWT({ exp: pastTime });
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, validJWT);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    expect(screen.getByText("Token Status")).toBeInTheDocument();
    expect(screen.getByText(/Expired \d+ minutes ago/)).toBeInTheDocument();
    expect(screen.getByText(/Expired \d+ minutes ago/)).toHaveClass("text-red-600");
  });

  it("does not show expiration status for token without exp claim", async () => {
    const user = userEvent.setup();
    const validJWT = createValidJWT({}); // No exp claim
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, validJWT);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    expect(screen.queryByText("Token Status")).not.toBeInTheDocument();
  });

  it("displays information about JWT", () => {
    render(<JWTDecoder />);
    
    expect(screen.getByText("About JWT")).toBeInTheDocument();
    expect(screen.getByText(/JSON Web Tokens \(JWT\) are an open standard/)).toBeInTheDocument();
    expect(screen.getByText("JWT Structure:")).toBeInTheDocument();
    expect(screen.getByText("Common Claims:")).toBeInTheDocument();
    expect(screen.getByText("iss")).toBeInTheDocument();
    expect(screen.getByText("sub")).toBeInTheDocument();
    expect(screen.getByText("exp")).toBeInTheDocument();
  });



  it("has proper accessibility labels", () => {
    render(<JWTDecoder />);
    
    expect(screen.getByLabelText("JWT Token")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decode JWT" })).toBeInTheDocument();
  });

  it("handles empty input gracefully", async () => {
    const user = userEvent.setup();
    
    render(<JWTDecoder />);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    // Should not show any results or errors
    expect(screen.queryByText("Header")).not.toBeInTheDocument();
    expect(screen.queryByText("Payload")).not.toBeInTheDocument();
    expect(screen.queryByText("Signature")).not.toBeInTheDocument();
  });

  it("formats JSON output correctly", async () => {
    const user = userEvent.setup();
    const validJWT = createValidJWT();
    
    render(<JWTDecoder />);
    
    const textarea = screen.getByLabelText("JWT Token");
    await user.type(textarea, validJWT);
    
    const decodeButton = screen.getByText("Decode JWT");
    await user.click(decodeButton);
    
    // Check that JSON is properly formatted (indented)
    const headerElement = screen.getByText(/"alg": "HS256"/).closest('pre');
    expect(headerElement?.textContent).toMatch(/^\s*{\s*\n\s*"alg": "HS256"/);
  });
});