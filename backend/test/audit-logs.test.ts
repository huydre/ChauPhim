/**
 * Test script to verify audit logs functionality
 * Run this after setting up the database and starting the server
 */

import { auditLogger, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../src/utils/auditLogger';

async function testAuditLogs() {
  console.log('🧪 Testing Audit Logs System...');

  try {
    // Test 1: Create audit log
    console.log('📝 Test 1: Creating audit log...');
    await auditLogger.logSuccess({
      userId: 'test-user-id',
      action: AUDIT_ACTIONS.CREATE_VIDEO,
      resource: AUDIT_RESOURCES.VIDEO,
      resourceId: 'test-video-id',
      details: {
        title: 'Test Movie',
        type: 'MOVIE',
        test: true,
      },
    });
    console.log('✅ Test 1 passed: Audit log created successfully');

    // Test 2: Create failed audit log
    console.log('📝 Test 2: Creating failed audit log...');
    await auditLogger.logFailure({
      userId: 'test-user-id',
      action: AUDIT_ACTIONS.DELETE_VIDEO,
      resource: AUDIT_RESOURCES.VIDEO,
      resourceId: 'test-video-id',
      details: {
        error: 'Permission denied',
        test: true,
      },
    });
    console.log('✅ Test 2 passed: Failed audit log created successfully');

    // Test 3: Create audit log without user (system action)
    console.log('📝 Test 3: Creating system audit log...');
    await auditLogger.logSuccess({
      action: AUDIT_ACTIONS.CHANGE_SETTINGS,
      resource: AUDIT_RESOURCES.SETTING,
      details: {
        setting: 'system_maintenance',
        value: true,
        test: true,
      },
    });
    console.log('✅ Test 3 passed: System audit log created successfully');

    console.log('🎉 All audit log tests passed!');
    console.log('');
    console.log('📊 To view the audit logs:');
    console.log('  1. Start the backend server');
    console.log('  2. Login as admin user');
    console.log('  3. Navigate to GET /audit-logs');
    console.log('  4. Or use the admin frontend at /audit-logs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAuditLogs();
}

export { testAuditLogs };
