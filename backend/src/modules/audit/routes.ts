import { Router } from 'express';
import { AuditController } from './controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
const auditController = new AuditController();

// All audit routes require admin authentication
router.use(authenticate);

// Audit logs routes
router.get('/', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/export', auditController.exportAuditLogs);

export default router;
