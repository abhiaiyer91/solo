/**
 * Manifest Lock Utility
 * 
 * Provides file-based locking to prevent race conditions when multiple
 * agents read/update the task manifest simultaneously.
 * 
 * Usage:
 *   npx ts-node scripts/manifest-lock.ts acquire <agent-id>
 *   npx ts-node scripts/manifest-lock.ts release <agent-id>
 *   npx ts-node scripts/manifest-lock.ts status
 *   npx ts-node scripts/manifest-lock.ts force-release
 */

import * as fs from 'fs';
import * as path from 'path';

const LOCK_FILE = path.join(__dirname, '../docs/planning/tasks/manifest.lock');
const MANIFEST_FILE = path.join(__dirname, '../docs/planning/tasks/manifest.json');
const LOCK_TIMEOUT_MS = 60000; // 60 seconds - stale lock threshold
const ACQUIRE_RETRY_MS = 500; // Retry interval when waiting for lock
const MAX_ACQUIRE_ATTEMPTS = 20; // Max retries (10 seconds total)

interface LockInfo {
  agentId: string;
  acquiredAt: string;
  pid?: number;
}

function readLock(): LockInfo | null {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const content = fs.readFileSync(LOCK_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    // Lock file corrupted or unreadable
    console.error('Warning: Could not read lock file, treating as unlocked');
  }
  return null;
}

function writeLock(agentId: string): void {
  const lockInfo: LockInfo = {
    agentId,
    acquiredAt: new Date().toISOString(),
    pid: process.pid
  };
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lockInfo, null, 2));
}

function deleteLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (e) {
    console.error('Warning: Could not delete lock file');
  }
}

function isLockStale(lock: LockInfo): boolean {
  const acquiredTime = new Date(lock.acquiredAt).getTime();
  const now = Date.now();
  return (now - acquiredTime) > LOCK_TIMEOUT_MS;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function acquireLock(agentId: string): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_ACQUIRE_ATTEMPTS; attempt++) {
    const existingLock = readLock();
    
    if (!existingLock) {
      // No lock exists, acquire it
      writeLock(agentId);
      console.log(`Lock acquired by ${agentId}`);
      return true;
    }
    
    if (existingLock.agentId === agentId) {
      // We already hold the lock
      console.log(`Lock already held by ${agentId}`);
      return true;
    }
    
    if (isLockStale(existingLock)) {
      // Lock is stale, force acquire
      console.log(`Stale lock from ${existingLock.agentId} (acquired ${existingLock.acquiredAt}), taking over`);
      writeLock(agentId);
      console.log(`Lock acquired by ${agentId}`);
      return true;
    }
    
    // Lock held by another agent, wait and retry
    if (attempt === 0) {
      console.log(`Lock held by ${existingLock.agentId}, waiting...`);
    }
    await sleep(ACQUIRE_RETRY_MS);
  }
  
  console.error(`Failed to acquire lock after ${MAX_ACQUIRE_ATTEMPTS} attempts`);
  return false;
}

function releaseLock(agentId: string): boolean {
  const existingLock = readLock();
  
  if (!existingLock) {
    console.log('No lock to release');
    return true;
  }
  
  if (existingLock.agentId !== agentId) {
    console.error(`Cannot release lock: held by ${existingLock.agentId}, not ${agentId}`);
    return false;
  }
  
  deleteLock();
  console.log(`Lock released by ${agentId}`);
  return true;
}

function showStatus(): void {
  const lock = readLock();
  
  if (!lock) {
    console.log('Status: UNLOCKED');
    console.log('Manifest is available for updates');
    return;
  }
  
  const stale = isLockStale(lock);
  console.log(`Status: LOCKED${stale ? ' (STALE)' : ''}`);
  console.log(`Agent: ${lock.agentId}`);
  console.log(`Acquired: ${lock.acquiredAt}`);
  if (lock.pid) {
    console.log(`PID: ${lock.pid}`);
  }
  
  const ageMs = Date.now() - new Date(lock.acquiredAt).getTime();
  console.log(`Age: ${Math.round(ageMs / 1000)}s`);
  
  if (stale) {
    console.log('\nLock is stale and can be overridden by next acquire attempt');
  }
}

function forceRelease(): void {
  const lock = readLock();
  if (lock) {
    console.log(`Force releasing lock held by ${lock.agentId}`);
  }
  deleteLock();
  console.log('Lock force released');
}

// CLI handling
const [,, command, agentId] = process.argv;

switch (command) {
  case 'acquire':
    if (!agentId) {
      console.error('Usage: manifest-lock.ts acquire <agent-id>');
      process.exit(1);
    }
    acquireLock(agentId).then(success => {
      process.exit(success ? 0 : 1);
    });
    break;
    
  case 'release':
    if (!agentId) {
      console.error('Usage: manifest-lock.ts release <agent-id>');
      process.exit(1);
    }
    process.exit(releaseLock(agentId) ? 0 : 1);
    break;
    
  case 'status':
    showStatus();
    break;
    
  case 'force-release':
    forceRelease();
    break;
    
  default:
    console.log(`
Manifest Lock Utility

Commands:
  acquire <agent-id>  - Acquire lock (waits up to 10s if held)
  release <agent-id>  - Release lock (only if held by same agent)
  status              - Show current lock status
  force-release       - Force release any lock (use with caution)

Examples:
  npx ts-node scripts/manifest-lock.ts acquire agent-worker-1
  npx ts-node scripts/manifest-lock.ts release agent-worker-1
  npx ts-node scripts/manifest-lock.ts status
`);
}
