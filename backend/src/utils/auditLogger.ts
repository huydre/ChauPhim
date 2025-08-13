import { AuditService } from '../modules/audit/service';
import { Request } from 'express';

interface AuditLogContext {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status?: 'SUCCESS' | 'FAILED';
  details?: any;
  req?: Request;
}

class AuditLogger {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async log(context: AuditLogContext) {
    try {
      const { userId, action, resource, resourceId, status = 'SUCCESS', details, req } = context;

      await this.auditService.createAuditLog({
        userId,
        action,
        resource,
        resourceId,
        status,
        details,
        ip: req ? this.getClientIp(req) : undefined,
        userAgent: req?.get('User-Agent') || undefined,
      });
    } catch (error) {
      // Don't throw error for audit logging failures to avoid breaking main functionality
      console.error('Failed to log audit:', error);
    }
  }

  // Log successful actions
  async logSuccess(context: Omit<AuditLogContext, 'status'>) {
    return this.log({ ...context, status: 'SUCCESS' });
  }

  // Log failed actions
  async logFailure(context: Omit<AuditLogContext, 'status'>) {
    return this.log({ ...context, status: 'FAILED' });
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      'unknown'
    );
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Export class for testing
export { AuditLogger };

// Commonly used audit actions
export const AUDIT_ACTIONS = {
  // Video/Movie actions
  CREATE_VIDEO: 'CREATE_VIDEO',
  UPDATE_VIDEO: 'UPDATE_VIDEO',
  DELETE_VIDEO: 'DELETE_VIDEO',
  PUBLISH_VIDEO: 'PUBLISH_VIDEO',
  UNPUBLISH_VIDEO: 'UNPUBLISH_VIDEO',
  UPLOAD_VIDEO: 'UPLOAD_VIDEO',
  TRANSCODE_VIDEO: 'TRANSCODE_VIDEO',
  
  // User actions
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  
  // Comment actions
  CREATE_COMMENT: 'CREATE_COMMENT',
  UPDATE_COMMENT: 'UPDATE_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
  
  // File actions
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_FILE: 'DELETE_FILE',
  
  // Admin actions
  CHANGE_SETTINGS: 'CHANGE_SETTINGS',
  EXPORT_DATA: 'EXPORT_DATA',
  
  // Genre actions
  CREATE_GENRE: 'CREATE_GENRE',
  UPDATE_GENRE: 'UPDATE_GENRE',
  DELETE_GENRE: 'DELETE_GENRE',
  
  // Cast actions
  CREATE_CAST: 'CREATE_CAST',
  UPDATE_CAST: 'UPDATE_CAST',
  DELETE_CAST: 'DELETE_CAST',
} as const;

// Commonly used resource types
export const AUDIT_RESOURCES = {
  VIDEO: 'video',
  USER: 'user',
  COMMENT: 'comment',
  FILE: 'file',
  SETTING: 'setting',
  AUTH: 'auth',
  GENRE: 'genre',
  CAST: 'cast',
  AUDIT_LOG: 'audit_log',
} as const;
