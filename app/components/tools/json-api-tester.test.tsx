import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonApiTester } from "~/components/tools/json-api-tester";

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe("JsonApiTester", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("renders with default values", () => {
    render(<JsonApiTester />);
    
    expect(screen.getByText("JSON API Tester")).toBeInTheDocument();
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getByText("Response")).toBeInTheDocument();
    expect(screen.getByText("GET")).toBeInTheDocument(); // Select component shows the value as text
    expect(screen.getByPlaceholderText(/Enter API URL/)).toBeInTheDocument();
  });

  it("displays sample URLs", () => {
    render(<JsonApiTester />);
    
    expect(screen.getByText("Sample URLs:")).toBeInTheDocument();
    
    // Should have sample URL buttons with descriptive labels
    expect(screen.getByText("JSONPlaceholder")).toBeInTheDocument();
    expect(screen.getByText("GitHub API")).toBeInTheDocument();
    expect(screen.getByText("HTTPBin")).toBeInTheDocument();
    expect(screen.getByText("CoinDesk API")).toBeInTheDocument();
  });

  it("allows adding and removing headers", async () => {
    const user = userEvent.setup();
    
    render(<JsonApiTester />);
    
    const addHeaderButton = screen.getByText("Add Header");
    await user.click(addHeaderButton);
    
    // Should show input fields for new header
    expect(screen.getByPlaceholderText("Header name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Header value")).toBeInTheDocument();
    
    const removeButton = screen.getByText("Remove");
    await user.click(removeButton);
    
    // Header inputs should be removed
    expect(screen.queryByPlaceholderText("Header name")).not.toBeInTheDocument();
  });

  it("shows request body for POST requests", async () => {
    const user = userEvent.setup();
    
    render(<JsonApiTester />);
    
    // Initially should not show request body for GET
    expect(screen.queryByPlaceholderText(/"key": "value"/)).not.toBeInTheDocument();
    
    // Click the select trigger and then click POST option
    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);
    const postOption = screen.getByText("POST");
    await user.click(postOption);
    
    // Should show request body for POST
    expect(screen.getByPlaceholderText(/"key": "value"/)).toBeInTheDocument();
    expect(screen.getByText("Request Body (JSON)")).toBeInTheDocument();
  });

  it("shows error when URL is empty", async () => {
    const user = userEvent.setup();
    
    render(<JsonApiTester />);
    
    const sendButton = screen.getByText("Send Request");
    await user.click(sendButton);
    
    expect(screen.getByText("Please enter a URL")).toBeInTheDocument();
  });

  it("sends GET request successfully", async () => {
    const user = userEvent.setup();
    
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
        "content-length": "50"
      }),
      text: vi.fn().mockResolvedValue('{"message": "success"}')
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    render(<JsonApiTester />);
    
    const urlInput = screen.getByPlaceholderText(/Enter API URL/) as HTMLInputElement;
    await user.type(urlInput, "https://api.example.com/test");
    
    const sendButton = screen.getByText("Send Request");
    await user.click(sendButton);
    
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        method: "GET",
        headers: {}
      })
    );
  });



  it("displays response information", async () => {
    const user = userEvent.setup();
    
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({
        "content-type": "application/json",
        "x-request-id": "123"
      }),
      text: vi.fn().mockResolvedValue('{"data": {"id": 1, "name": "Test"}}')
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    render(<JsonApiTester />);
    
    const urlInput = screen.getByPlaceholderText(/Enter API URL/) as HTMLInputElement;
    await user.type(urlInput, "https://api.example.com/test");
    
    const sendButton = screen.getByText("Send Request");
    await user.click(sendButton);
    
    // Should show response status
    expect(screen.getByText("200 OK")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    
    // Should show response headers
    expect(screen.getByText("Response Headers:")).toBeInTheDocument();
    
    // Should show response body
    expect(screen.getByText("Response Body:")).toBeInTheDocument();
    expect(screen.getByText(/"id": 1/)).toBeInTheDocument();
    expect(screen.getByText(/"name": "Test"/)).toBeInTheDocument();
  });

  it("handles request errors", async () => {
    const user = userEvent.setup();
    
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    
    render(<JsonApiTester />);
    
    const urlInput = screen.getByPlaceholderText(/Enter API URL/) as HTMLInputElement;
    await user.type(urlInput, "https://api.example.com/test");
    
    const sendButton = screen.getByText("Send Request");
    await user.click(sendButton);
    
    expect(screen.getByText("Error:")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("saves and loads request history", async () => {
    const user = userEvent.setup();
    
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      text: vi.fn().mockResolvedValue('{"success": true}')
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    render(<JsonApiTester />);
    
    const urlInput = screen.getByPlaceholderText(/Enter API URL/) as HTMLInputElement;
    await user.type(urlInput, "https://api.example.com/test");
    
    const sendButton = screen.getByText("Send Request");
    await user.click(sendButton);
    
    // Should save to history
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "api-tester-history",
      expect.stringContaining("https://api.example.com/test")
    );
    
    // Should show in history section
    expect(screen.getByText("Request History")).toBeInTheDocument();
    expect(screen.getByText("https://api.example.com/test")).toBeInTheDocument();
  });

  it("loads sample URL when clicking sample button", async () => {
    const user = userEvent.setup();
    
    render(<JsonApiTester />);
    
    const jsonPlaceholderButton = screen.getByText("JSONPlaceholder");
    await user.click(jsonPlaceholderButton);
    
    const urlInput = screen.getByPlaceholderText(/Enter API URL/) as HTMLInputElement;
    expect(urlInput.value).toBe("https://jsonplaceholder.typicode.com/posts/1");
  });

  it("copies response body to clipboard", async () => {
    const user = userEvent.setup();
    
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      text: vi.fn().mockResolvedValue('{"data": "test"}')
    };
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    // Mock clipboard
    const mockClipboard = {
      writeText: vi.fn(),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });
    
    render(<JsonApiTester />);
    
    const urlInput = screen.getByPlaceholderText(/Enter API URL/) as HTMLInputElement;
    await user.type(urlInput, "https://api.example.com/test");
    
    const sendButton = screen.getByText("Send Request");
    await user.click(sendButton);
    
    const copyButton = screen.getByText("Copy");
    await user.click(copyButton);
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  it("has proper accessibility labels", () => {
    render(<JsonApiTester />);
    
    expect(screen.getByPlaceholderText(/Enter API URL/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Request" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Header" })).toBeInTheDocument();
  });

  it("displays information about the tool", () => {
    render(<JsonApiTester />);
    
    expect(screen.getByText("About JSON API Tester")).toBeInTheDocument();
    expect(screen.getByText(/This tool allows you to test REST APIs/)).toBeInTheDocument();
    expect(screen.getByText("Supported Features:")).toBeInTheDocument();
    expect(screen.getByText("Common Use Cases:")).toBeInTheDocument();
  });
});