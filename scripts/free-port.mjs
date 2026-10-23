#!/usr/bin/env node
/**
 * Frees a TCP listen port before starting a dev server.
 * Usage:
 *   node scripts/free-port.mjs --env apps/api/.env
 *   node scripts/free-port.mjs --port 3603
 *   node scripts/free-port.mjs --env apps/api/.env --dry-run
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const isWindows = process.platform === 'win32';

function parseArgs(argv) {
  let envFile = '';
  let portOverride = '';
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--env') {
      envFile = argv[++i] ?? '';
    } else if (arg === '--port') {
      portOverride = argv[++i] ?? '';
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '-h' || arg === '--help') {
      console.log(`Usage: node scripts/free-port.mjs [--env path] [--port N] [--dry-run]`);
      process.exit(0);
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  return { envFile, portOverride, dryRun };
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readPortFromEnv(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const keys = ['PORT', 'API_PORT', 'DEV_PORT', 'SERVER_PORT'];
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const key of keys) {
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const match = line.match(new RegExp(`^${key}\\s*=\\s*(.*)$`));
      if (!match) continue;
      const value = stripQuotes(match[1]);
      if (/^\d+$/.test(value)) {
        return value;
      }
    }
  }

  return null;
}

function findPidsWindows(port) {
  const output = execFileSync('netstat', ['-ano'], { encoding: 'utf8' });
  const pids = new Set();
  const portPattern = new RegExp(`:${port}\\s`);

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes('LISTENING') || !portPattern.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function findPidsUnix(port) {
  try {
    const output = execFileSync('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN'], {
      encoding: 'utf8',
    });
    return output
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (pid === '0' || pid === '4') {
    return false;
  }

  if (isWindows) {
    execFileSync('taskkill', ['/F', '/PID', pid], { stdio: 'ignore' });
    return true;
  }

  execFileSync('kill', ['-9', pid], { stdio: 'ignore' });
  return true;
}

async function main() {
  const { envFile, portOverride, dryRun } = parseArgs(process.argv.slice(2));

  let port = portOverride;
  if (!port) {
    const envPath = resolve(process.cwd(), envFile || '.env');
    port = readPortFromEnv(envPath);
    if (!port) {
      console.error(`No PORT found in ${envPath}. Pass --port <n>.`);
      process.exit(1);
    }
    console.log(`Port from ${envPath}: ${port}`);
  } else {
    console.log(`Port: ${port}`);
  }

  if (!/^\d+$/.test(port)) {
    console.error(`Invalid port: ${port}`);
    process.exit(1);
  }

  const pids = isWindows ? findPidsWindows(port) : findPidsUnix(port);

  if (pids.length === 0) {
    console.log(`Port ${port} is already free.`);
    return;
  }

  console.log(`Processes on port ${port}: ${pids.join(', ')}`);

  if (dryRun) {
    console.log('Dry-run: no processes killed.');
    return;
  }

  for (const pid of pids) {
    try {
      killPid(pid);
      console.log(`Killed PID ${pid}`);
    } catch {
      console.error(`Failed to kill PID ${pid}`);
    }
  }

  await delay(400);

  const remaining = isWindows ? findPidsWindows(port) : findPidsUnix(port);
  if (remaining.length === 0) {
    console.log(`Port ${port} freed.`);
    return;
  }

  console.error(`Port ${port} still in use by: ${remaining.join(', ')}`);
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
