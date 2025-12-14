import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface JWTPayload {
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTPayload;
  payload: JWTPayload;
  signature: string;
  isValid: boolean;
  error?: string;
}

export function JWTDecoder() {
  const [jwtInput, setJwtInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);

  const decodeJWT = (token: string): DecodedJWT => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return {
          header: {},
          payload: {},
          signature: "",
          isValid: false,
          error: "Invalid JWT format. Expected 3 parts separated by dots.",
        };
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      const signature = parts[2];

      return {
        header,
        payload,
        signature,
        isValid: true,
      };
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: "",
        isValid: false,
        error: error instanceof Error ? error.message : "Failed to decode JWT",
      };
    }
  };

  const handleDecode = () => {
    if (!jwtInput.trim()) {
      setDecoded(null);
      return;
    }

    const result = decodeJWT(jwtInput.trim());
    setDecoded(result);
  };

  const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getExpirationStatus = (exp: number) => {
    const now = Math.floor(Date.now() / 1000);
    if (exp > now) {
      const minutesLeft = Math.floor((exp - now) / 60);
      return { status: "valid", text: `Valid for ${minutesLeft} minutes`, color: "text-green-600" };
    } else {
      const minutesExpired = Math.floor((now - exp) / 60);
      return { status: "expired", text: `Expired ${minutesExpired} minutes ago`, color: "text-red-600" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">JWT Decoder</h1>
        <p className="text-muted-foreground">
          Decode JSON Web Tokens (JWT) instantly in your browser. All processing happens client-side - no data is sent to any server.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>JWT Token</CardTitle>
          <CardDescription>Enter your JWT token to decode its contents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jwt-input">JWT Token</Label>
            <Textarea
              id="jwt-input"
              className="min-h-[100px] font-mono text-sm resize-none"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste your JWT token here. It should have three parts separated by dots (header.payload.signature)
            </p>
          </div>
          <Button onClick={handleDecode} className="w-full">
            Decode JWT
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Header
                {decoded.isValid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatJSON(decoded.header))}
                  >
                    Copy
                  </Button>
                )}
              </CardTitle>
              <CardDescription>JWT header information</CardDescription>
            </CardHeader>
            <CardContent>
              {decoded.isValid ? (
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {formatJSON(decoded.header)}
                </pre>
              ) : (
                <div className="text-red-600 text-sm">{decoded.error}</div>
              )}
            </CardContent>
          </Card>

          {/* Payload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Payload
                {decoded.isValid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatJSON(decoded.payload))}
                  >
                    Copy
                  </Button>
                )}
              </CardTitle>
              <CardDescription>JWT payload data</CardDescription>
            </CardHeader>
            <CardContent>
              {decoded.isValid ? (
                <div className="space-y-4">
                  {/* Expiration Status */}
                  {decoded.payload.exp && (
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm font-medium">Token Status</div>
                      <div className={getExpirationStatus(decoded.payload.exp).color}>
                        {getExpirationStatus(decoded.payload.exp).text}
                      </div>
                    </div>
                  )}
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    {formatJSON(decoded.payload)}
                  </pre>
                </div>
              ) : (
                <div className="text-red-600 text-sm">{decoded.error}</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signature Section */}
      {decoded && decoded.isValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Signature
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(decoded.signature)}
              >
                Copy
              </Button>
            </CardTitle>
            <CardDescription>JWT signature (encoded)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md break-all font-mono text-sm">
              {decoded.signature}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About JWT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            JSON Web Tokens (JWT) are an open standard (RFC 7519) that defines a compact and self-contained way
            for securely transmitting information between parties as a JSON object.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">JWT Structure:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Header:</strong> Contains metadata about the token (algorithm, token type)</li>
              <li><strong>Payload:</strong> Contains the claims (user data, permissions, expiration)</li>
              <li><strong>Signature:</strong> Cryptographic signature to verify the token wasn't tampered with</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Common Claims:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code>iss</code> - Issuer of the token</li>
              <li><code>sub</code> - Subject (user ID)</li>
              <li><code>aud</code> - Audience (who the token is for)</li>
              <li><code>exp</code> - Expiration time</li>
              <li><code>iat</code> - Issued at time</li>
              <li><code>nbf</code> - Not valid before</li>
            </ul>
          </div>
          <p className="text-xs italic flex items-center gap-2">
            Never decode untrusted JWT tokens and use the data without proper verification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
