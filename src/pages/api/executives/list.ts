import type { NextApiRequest, NextApiResponse } from "next";

const EXECUTIVE_SERVICE_URL = "http://10.15.38.1:8300";

interface Executive {
  id: string;
  name: string;
  role: string;
  status: string;
  capabilities?: string[];
}

interface ExecutiveListResponse {
  executives: Executive[];
  total: number;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutiveListResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
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

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (req.query.limit) queryParams.append("limit", String(req.query.limit));
    if (req.query.offset) queryParams.append("offset", String(req.query.offset));
    if (req.query.role) queryParams.append("role", String(req.query.role));
    if (req.query.status) queryParams.append("status", String(req.query.status));

    const queryString = queryParams.toString();
    const url = `${EXECUTIVE_SERVICE_URL}/executives/list${queryString ? `?${queryString}` : ""}`;

    // Forward request to executive service
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Executive Service Error",
        message: data.message || "Failed to fetch executives list",
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
