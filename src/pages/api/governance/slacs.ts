import type { NextApiRequest, NextApiResponse } from "next";

const GOVERNANCE_SERVICE_URL = "http://10.15.38.1:8400";

interface SLAC {
  id: string;
  name: string;
  description: string;
  level: number;
  criteria: string[];
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface SLACListResponse {
  slacs: SLAC[];
  total: number;
  hasMore: boolean;
}

interface SLACCreateRequest {
  name: string;
  description: string;
  level: number;
  criteria: string[];
  metadata?: Record<string, unknown>;
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SLACListResponse | SLAC | ErrorResponse>
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

    if (req.method === "GET") {
      // GET - List SLACs (Service Level Agreement Commitments)
      const queryParams = new URLSearchParams();
      if (req.query.limit) queryParams.append("limit", String(req.query.limit));
      if (req.query.offset) queryParams.append("offset", String(req.query.offset));
      if (req.query.level) queryParams.append("level", String(req.query.level));
      if (req.query.status) queryParams.append("status", String(req.query.status));

      const queryString = queryParams.toString();
      const url = `${GOVERNANCE_SERVICE_URL}/governance/slacs${queryString ? `?${queryString}` : ""}`;

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
          error: data.error || "Governance Service Error",
          message: data.message || "Failed to fetch SLACs",
          statusCode: response.status,
        });
      }

      return res.status(200).json(data);
    } else if (req.method === "POST") {
      // POST - Create new SLAC
      const body = req.body as Partial<SLACCreateRequest>;
      if (!body.name || !body.description || body.level === undefined || !body.criteria) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Missing required fields: name, description, level, and criteria",
          statusCode: 400,
        });
      }

      if (!Array.isArray(body.criteria) || body.criteria.length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Criteria must be a non-empty array",
          statusCode: 400,
        });
      }

      const response = await fetch(`${GOVERNANCE_SERVICE_URL}/governance/slacs`, {
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
          message: data.message || "Failed to create SLAC",
          statusCode: response.status,
        });
      }

      return res.status(201).json(data);
    } else {
      return res.status(405).json({
        error: "Method Not Allowed",
        message: `Method ${req.method} not allowed`,
        statusCode: 405,
      });
    }
  } catch (error) {
    console.error("Error proxying to governance service:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500,
    });
  }
}
