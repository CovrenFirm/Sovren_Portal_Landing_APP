import type { NextApiRequest, NextApiResponse } from "next";

const GOVERNANCE_SERVICE_URL = "http://10.15.38.1:8400";

interface VerificationRequest {
  sealId?: string;
  hash?: string;
  signature?: string;
  data?: Record<string, unknown>;
}

interface VerificationResult {
  valid: boolean;
  sealId?: string;
  timestamp: string;
  issuer?: string;
  status?: string;
  details?: Record<string, unknown>;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResult | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: `Method ${req.method} not allowed`,
      statusCode: 405,
    });
  }

  try {
    // Extract authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing authorization token",
        statusCode: 401,
      });
    }

    // Validate request body
    const body = req.body as Partial<VerificationRequest>;
    if (!body.sealId && !body.hash && !body.signature) {
      return res.status(400).json({
        error: "Bad Request",
        message: "At least one of sealId, hash, or signature is required",
        statusCode: 400,
      });
    }

    // Forward request to governance service
    const response = await fetch(`${GOVERNANCE_SERVICE_URL}/governance/verify`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Governance Service Error",
        message: data.message || "Failed to verify seal",
        statusCode: response.status,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error proxying to governance service:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500,
    });
  }
}
