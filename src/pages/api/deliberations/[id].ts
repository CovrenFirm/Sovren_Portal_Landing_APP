import type { NextApiRequest, NextApiResponse } from "next";

const EXECUTIVE_SERVICE_URL = "http://10.15.38.1:8300";

interface DeliberationMessage {
  id: string;
  executiveId: string;
  executiveName: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface DeliberationDetails {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "pending" | "archived";
  participants: string[];
  messages: DeliberationMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeliberationDetails | ErrorResponse>
) {
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

    // Extract deliberation ID from URL
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid or missing deliberation ID",
        statusCode: 400,
      });
    }

    if (req.method === "GET") {
      // GET - Fetch deliberation details
      const response = await fetch(`${EXECUTIVE_SERVICE_URL}/deliberations/${id}`, {
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
          message: data.message || "Failed to fetch deliberation details",
          statusCode: response.status,
        });
      }

      return res.status(200).json(data);
    } else if (req.method === "POST") {
      // POST - Add message to deliberation
      const body = req.body;
      if (!body.executiveId || !body.content) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Missing required fields: executiveId and content",
          statusCode: 400,
        });
      }

      const response = await fetch(`${EXECUTIVE_SERVICE_URL}/deliberations/${id}`, {
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
          message: data.message || "Failed to add message to deliberation",
          statusCode: response.status,
        });
      }

      return res.status(200).json(data);
    } else if (req.method === "PATCH") {
      // PATCH - Update deliberation status
      const body = req.body;

      const response = await fetch(`${EXECUTIVE_SERVICE_URL}/deliberations/${id}`, {
        method: "PATCH",
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
          message: data.message || "Failed to update deliberation",
          statusCode: response.status,
        });
      }

      return res.status(200).json(data);
    } else {
      return res.status(405).json({
        error: "Method Not Allowed",
        message: `Method ${req.method} not allowed`,
        statusCode: 405,
      });
    }
  } catch (error) {
    console.error("Error proxying to executive service:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500,
    });
  }
}
