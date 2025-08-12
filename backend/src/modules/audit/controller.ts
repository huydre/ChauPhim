import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { AuditService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  // Get audit logs with filtering and pagination
  getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const {
      page = 1,
      limit = 20,
      action,
      status,
      userId,
      resource,
      startDate,
      endDate,
      search,
    } = req.query as any;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      action,
      status,
      userId,
      resource,
      startDate,
      endDate,
      search,
    };

    const result = await this.auditService.getAuditLogs(filters);
    
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  // Get audit log statistics
  getAuditStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { period = '7d' } = req.query as any;
    const result = await this.auditService.getAuditStats(period);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Export audit logs
  exportAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const {
      format = 'csv',
      action,
      status,
      userId,
      resource,
      startDate,
      endDate,
      search,
    } = req.query as any;

    const filters = {
      action,
      status,
      userId,
      resource,
      startDate,
      endDate,
      search,
    };

    const result = await this.auditService.exportAuditLogs(filters, format);
    
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    return res.send(result.content);
  });
}
