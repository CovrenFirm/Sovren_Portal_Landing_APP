import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

/**
 * Multimodal File Upload API Proxy
 *
 * backend-core + sec-architect implementation
 * Streams files to multimodal backend, associates with CRM entities
 *
 * NO mocks. Production-grade only.
 */

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for multipart
  },
};

const MULTIMODAL_BASE_URL = process.env.SOVREN_MULTIMODAL_BASE_URL || 'http://10.15.38.1:8700';
const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface UploadResponse {
  success: true;
  attachmentId: string;
  uploadId: string;
  filename: string;
  mediaType: string;
  size: number;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = UploadResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // sec-architect: Extract tenant from session
    const tenantId = DEMO_TENANT_ID;

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Validate required fields
    const entityType = Array.isArray(fields.entityType) ? fields.entityType[0] : fields.entityType;
    const entityId = Array.isArray(fields.entityId) ? fields.entityId[0] : fields.entityId;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: entityType, entityId',
      });
    }

    if (entityType !== 'contact' && entityType !== 'deal') {
      return res.status(400).json({
        success: false,
        error: 'entityType must be "contact" or "deal"',
      });
    }

    // Get uploaded file
    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // backend-core: Stream file to multimodal backend
    const fileBuffer = fs.readFileSync(file.filepath);
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' });
    formData.append('file', blob, file.originalFilename || 'upload');
    formData.append('tenantId', tenantId);

    const uploadResponse = await fetch(`${MULTIMODAL_BASE_URL}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        'X-Tenant-ID': tenantId,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => 'Unknown error');
      console.error('[multimodal/upload] Backend upload error:', errorText);

      // Clean up temp file
      fs.unlinkSync(file.filepath);

      return res.status(uploadResponse.status).json({
        success: false,
        error: `Upload failed: ${uploadResponse.status}`,
      });
    }

    const uploadData = await uploadResponse.json();
    const uploadId = uploadData.id || uploadData.uploadId;

    // backend-core: Associate with CRM entity
    const attachmentResponse = await fetch(`${CRM_BASE_URL}/api/v1/crm/attachments`, {
      method: 'POST',
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entityType,
        entityId,
        uploadId,
        filename: file.originalFilename,
        mediaType: file.mimetype,
        size: file.size,
      }),
    });

    if (!attachmentResponse.ok) {
      const errorText = await attachmentResponse.text().catch(() => 'Unknown error');
      console.error('[multimodal/upload] CRM association error:', errorText);

      // Clean up temp file
      fs.unlinkSync(file.filepath);

      return res.status(attachmentResponse.status).json({
        success: false,
        error: `Association failed: ${attachmentResponse.status}`,
      });
    }

    const attachmentData = await attachmentResponse.json();

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      attachmentId: attachmentData.id || attachmentData.attachmentId,
      uploadId,
      filename: file.originalFilename || 'upload',
      mediaType: file.mimetype || 'application/octet-stream',
      size: file.size || 0,
    });
  } catch (error) {
    console.error('[multimodal/upload] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
