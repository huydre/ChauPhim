import prisma from '../../infra/db';
import { AppError } from '../../middlewares/errorHandler';
import logger from '../../config/logger';

export interface AuditLogFilters {
  page: number;
  limit: number;
  action?: string;
  status?: string;
  userId?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateAuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILED';
  details?: any;
}

export class AuditService {
  // Create new audit log entry
  async createAuditLog(data: CreateAuditLogData) {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          ...(data.resourceId && { resourceId: data.resourceId }),
          ...(data.ip && { ip: data.ip }),
          ...(data.userAgent && { userAgent: data.userAgent }),
          ...(data.status && { status: data.status }),
          ...(data.details && { details: JSON.stringify(data.details) }),
        } as any,
      });

      return auditLog;
    } catch (error: any) {
      logger.error('Failed to create audit log:', error);
      throw new AppError('Failed to create audit log', 500);
    }
  }

  // Get audit logs with filtering and pagination
  async getAuditLogs(filters: AuditLogFilters) {
    try {
      const { page, limit, action, status, userId, resource, startDate, endDate, search } = filters;
      
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};
      
      if (action) where.action = action;
      if (status) where.status = status;
      if (userId) where.userId = userId;
      if (resource) where.resource = resource;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      
      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
          { ip: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Get total count for pagination
      const total = await prisma.auditLog.count({ where });

      // Get audit logs with user information
      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      // Transform data for frontend
      const transformedLogs = auditLogs.map(log => {
        const logWithExtendedFields = log as any;
        return {
          id: log.id,
          userId: log.userId,
          userName: log.user?.name || 'Unknown User',
          userEmail: log.user?.email || 'unknown@example.com',
          userRole: log.user?.role || 'UNKNOWN',
          action: log.action,
          resource: log.resource,
          resourceId: logWithExtendedFields.resourceId || null,
          ip: log.ip,
          userAgent: log.userAgent,
          status: logWithExtendedFields.status || 'SUCCESS',
          details: logWithExtendedFields.details ? JSON.parse(logWithExtendedFields.details) : null,
          timestamp: log.createdAt.toISOString(),
          createdAt: log.createdAt,
        };
      });

      return {
        data: transformedLogs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Failed to get audit logs:', error);
      throw new AppError('Failed to get audit logs', 500);
    }
  }

  // Get audit statistics
  async getAuditStats(period: string = '7d') {
    try {
      let startDate: Date;
      const endDate = new Date();

      switch (period) {
        case '24h':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      const where = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Get total logs count
      const totalLogs = await prisma.auditLog.count({ where });

      // Get success/failed counts
      const successCount = await prisma.auditLog.count({
        where: { ...where } as any,
      });

      const failedCount = await prisma.auditLog.count({
        where: { ...where } as any,
      });

      // Get unique users count
      const uniqueUsers = await prisma.auditLog.findMany({
        where,
        select: { userId: true },
        distinct: ['userId'],
      });

      // Get action breakdown
      const actionStats = await prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: {
          action: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
        take: 10,
      });

      // Get daily activity (last 7 days)
      const dailyActivity = await this.getDailyActivityStats(startDate, endDate);

      return {
        summary: {
          totalLogs,
          successCount,
          failedCount,
          successRate: totalLogs > 0 ? (successCount / totalLogs) * 100 : 0,
          uniqueUsersCount: uniqueUsers.length,
        },
        actionBreakdown: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action,
        })),
        dailyActivity,
        period,
      };
    } catch (error: any) {
      logger.error('Failed to get audit stats:', error);
      throw new AppError('Failed to get audit stats', 500);
    }
  }

  // Get daily activity statistics
  private async getDailyActivityStats(startDate: Date, endDate: Date) {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = await prisma.auditLog.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      days.push({
        date: current.toISOString().split('T')[0],
        count: dayLogs,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  // Export audit logs
  async exportAuditLogs(filters: Omit<AuditLogFilters, 'page' | 'limit'>, format: string = 'csv') {
    try {
      const { action, status, userId, resource, startDate, endDate, search } = filters;
      
      // Build where clause (same as getAuditLogs but without pagination)
      const where: any = {};
      
      if (action) where.action = action;
      if (status) where.status = status;
      if (userId) where.userId = userId;
      if (resource) where.resource = resource;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      
      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resource: { contains: search, mode: 'insensitive' } },
          { ip: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Get all matching audit logs
      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10000, // Limit to prevent memory issues
      });

      if (format === 'csv') {
        const csvHeaders = [
          'Timestamp',
          'User Name',
          'User Email',
          'Action',
          'Resource',
          'Resource ID',
          'Status',
          'IP Address',
          'User Agent',
          'Details',
        ].join(',');

        const csvRows = auditLogs.map(log => {
          const logWithExtendedFields = log as any;
          return [
            log.createdAt.toISOString(),
            log.user?.name || 'Unknown User',
            log.user?.email || 'unknown@example.com',
            log.action,
            log.resource,
            logWithExtendedFields.resourceId || '',
            logWithExtendedFields.status || 'SUCCESS',
            log.ip || '',
            `"${log.userAgent || ''}"`,
            `"${logWithExtendedFields.details || ''}"`,
          ].join(',');
        });

        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        return {
          content: csvContent,
          contentType: 'text/csv',
          filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
        };
      }

      // JSON format
      const transformedLogs = auditLogs.map(log => {
        const logWithExtendedFields = log as any;
        return {
          id: log.id,
          userId: log.userId,
          userName: log.user?.name || 'Unknown User',
          userEmail: log.user?.email || 'unknown@example.com',
          userRole: log.user?.role || 'UNKNOWN',
          action: log.action,
          resource: log.resource,
          resourceId: logWithExtendedFields.resourceId || null,
          ip: log.ip,
          userAgent: log.userAgent,
          status: logWithExtendedFields.status || 'SUCCESS',
          details: logWithExtendedFields.details ? JSON.parse(logWithExtendedFields.details) : null,
          timestamp: log.createdAt.toISOString(),
        };
      });

      return {
        content: JSON.stringify(transformedLogs, null, 2),
        contentType: 'application/json',
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.json`,
      };
    } catch (error: any) {
      logger.error('Failed to export audit logs:', error);
      throw new AppError('Failed to export audit logs', 500);
    }
  }
}
