import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Header {
  key: string;
  value: string;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: number;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  size: number;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

const sampleUrls = [
  "https://jsonplaceholder.typicode.com/posts/1",
  "https://api.github.com/users/octocat",
  "https://httpbin.org/get",
  "https://api.coindesk.com/v1/bpi/currentprice.json"
];

export function JsonApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([]);
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RequestHistory[]>([]);

  // Load history from localStorage on mount
  useState(() => {
    const savedHistory = localStorage.getItem("api-tester-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  });

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: keyof Header, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const validateJson = (jsonString: string): boolean => {
    if (!jsonString.trim()) return true; // Empty body is valid for GET requests
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const saveToHistory = (method: string, url: string) => {
    const newEntry: RequestHistory = {
      id: Date.now().toString(),
      method,
      url,
      timestamp: Date.now()
    };
    
    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem("api-tester-history", JSON.stringify(updatedHistory));
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateJson(requestBody) && ["POST", "PUT", "PATCH"].includes(method)) {
      setError("Invalid JSON in request body");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const startTime = Date.now();
      
      // Build headers object
      const headersObj: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key && header.value) {
          headersObj[header.key] = header.value;
        }
      });

      // Add Content-Type for requests with body
      if (["POST", "PUT", "PATCH"].includes(method) && requestBody.trim()) {
        headersObj["Content-Type"] = "application/json";
      }

      const fetchOptions: RequestInit = {
        method,
        headers: headersObj,
      };

      // Add body for methods that support it
      if (["POST", "PUT", "PATCH"].includes(method) && requestBody.trim()) {
        fetchOptions.body = requestBody;
      }

      const response = await fetch(url, fetchOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response data
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        responseTime,
        size: new Blob([responseText]).size
      };

      setResponse(apiResponse);
      saveToHistory(method, url);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (entry: RequestHistory) => {
    setMethod(entry.method);
    setUrl(entry.url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("api-tester-history");
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 300 && status < 400) return "text-yellow-600";
    if (status >= 400 && status < 500) return "text-orange-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">JSON API Tester</h1>
        <p className="text-muted-foreground">
          Test REST APIs with JSON payloads. All requests are made directly from your browser using the native fetch API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Section */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure your API request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and URL */}
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {HTTP_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <Input
                placeholder="Enter API URL (e.g., https://api.example.com/data)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Sample URLs */}
            <div className="space-y-2">
              <Label>Sample URLs:</Label>
              <div className="flex flex-wrap gap-2">
                {sampleUrls.map(sampleUrl => (
                  <Button
                    key={sampleUrl}
                    variant="outline"
                    size="sm"
                    onClick={() => setUrl(sampleUrl)}
                  >
                    Use
                  </Button>
                ))}
              </div>
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Headers</Label>
                <Button onClick={addHeader} variant="outline" size="sm">
                  Add Header
                </Button>
              </div>
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeHeader(index)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Request Body */}
            {["POST", "PUT", "PATCH"].includes(method) && (
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <textarea
                  className="w-full h-32 p-3 border rounded-md font-mono text-sm bg-muted/30"
                  placeholder='{"key": "value"}'
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  spellCheck={false}
                />
                {!validateJson(requestBody) && requestBody.trim() && (
                  <p className="text-sm text-red-600">Invalid JSON format</p>
                )}
              </div>
            )}

            {/* Send Button */}
            <Button 
              onClick={sendRequest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Section */}
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>API response details</CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Status:</Label>
                    <span className={`font-mono font-semibold ${getStatusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {response.responseTime}ms • {response.size} bytes
                  </div>
                </div>

                {/* Response Headers */}
                <div className="space-y-2">
                  <Label>Response Headers:</Label>
                  <div className="max-h-32 overflow-auto border rounded-md p-2 bg-muted/30">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="text-sm font-mono">
                        <span className="text-blue-600">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Response Body:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(formatJson(response.data))}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-auto border rounded-md p-3 bg-muted/30">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {formatJson(response.data)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Send a request to see the response here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request History</CardTitle>
            {history.length > 0 && (
              <Button onClick={clearHistory} variant="outline" size="sm">
                Clear History
              </Button>
            )}
          </div>
          <CardDescription>Recent API requests (stored locally)</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                  onClick={() => loadFromHistory(entry)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {entry.method}
                    </span>
                    <span className="font-mono text-sm truncate max-w-md">
                      {entry.url}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <p>No request history yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About JSON API Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            This tool allows you to test REST APIs with JSON payloads directly from your browser. 
            All requests are made using the native fetch API, ensuring maximum compatibility and performance.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Supported Features:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)</li>
              <li>Custom request headers</li>
              <li>JSON request body with validation</li>
              <li>Response status, headers, and body display</li>
              <li>Request timing and size information</li>
              <li>Local request history (stored in browser)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Common Use Cases:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Testing REST API endpoints</li>
              <li>Debugging API responses</li>
              <li>Exploring public APIs</li>
              <li>Validating JSON data structures</li>
              <li>Checking API performance</li>
            </ul>
          </div>
          <p className="text-xs italic">
            ⚠️ Be cautious when testing APIs with authentication tokens or sensitive data. 
            Request history is stored locally in your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}