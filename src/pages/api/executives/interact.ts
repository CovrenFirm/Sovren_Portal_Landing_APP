import type { NextApiRequest, NextApiResponse } from "next";

const EXECUTIVE_SERVICE_URL = "http://10.15.38.1:8300";

interface InteractionRequest {
  executiveId: string;
  message: string;
  context?: Record<string, unknown>;
}

interface InteractionResponse {
  executiveId: string;
  response: string;
  timestamp: string;
  sessionId?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InteractionResponse | ErrorResponse>
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
    const body = req.body as Partial<InteractionRequest>;
    if (!body.executiveId || !body.message) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing required fields: executiveId and message",
        statusCode: 400,
      });
    }

    // Forward request to executive service
    const response = await fetch(`${EXECUTIVE_SERVICE_URL}/executives/interact`, {
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
        error: data.error || "Executive Service Error",
        message: data.message || "Failed to interact with executive",
        statusCode: response.status,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error proxying to executive service:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500,
    });
  }
}
