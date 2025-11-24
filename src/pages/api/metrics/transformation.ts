import type { NextApiRequest, NextApiResponse } from "next";

const METRICS_SERVICE_URL = "http://10.15.38.1:8250";

interface MetricDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

interface TransformationMetrics {
  transformationId: string;
  type: string;
  status: "active" | "completed" | "failed" | "pending";
  startTime: string;
  endTime?: string;
  duration?: number;
  inputSize?: number;
  outputSize?: number;
  throughput?: number;
  errorRate?: number;
  dataPoints: MetricDataPoint[];
  metadata?: Record<string, unknown>;
}

interface TransformationMetricsResponse {
  metrics: TransformationMetrics;
  summary: {
    totalTransformations: number;
    averageDuration: number;
    successRate: number;
    totalDataProcessed: number;
  };
}

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransformationMetricsResponse | ErrorResponse>
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
    if (req.query.transformationId) {
      queryParams.append("transformationId", String(req.query.transformationId));
    }
    if (req.query.type) queryParams.append("type", String(req.query.type));
    if (req.query.status) queryParams.append("status", String(req.query.status));
    if (req.query.from) queryParams.append("from", String(req.query.from));
    if (req.query.to) queryParams.append("to", String(req.query.to));
    if (req.query.limit) queryParams.append("limit", String(req.query.limit));
    if (req.query.offset) queryParams.append("offset", String(req.query.offset));
    if (req.query.interval) queryParams.append("interval", String(req.query.interval));

    const queryString = queryParams.toString();
    const url = `${METRICS_SERVICE_URL}/metrics/transformation${queryString ? `?${queryString}` : ""}`;

    // Forward request to metrics service
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
        error: data.error || "Metrics Service Error",
        message: data.message || "Failed to fetch transformation metrics",
        statusCode: response.status,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error proxying to metrics service:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      statusCode: 500,
    });
  }
}
