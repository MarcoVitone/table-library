import { execFile, spawn } from 'node:child_process';
import { promisify, stripVTControlCharacters } from 'node:util';

export default async function globalSetup() {
  console.log('Building E2E app...');
  await promisify(execFile)(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--configLoader', 'runner'], { windowsHide: true, timeout: 120_000 });
  console.log('Starting E2E preview...');
  const address = 'http://127.0.0.1:4187/';
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--configLoader', 'runner', '--host', '127.0.0.1', '--port', '4187', '--strictPort'], { windowsHide: true, stdio: 'pipe' });
  let output = '';
  let spawnError;
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  const stopped = new Promise(resolve => {
    server.once('exit', resolve);
    server.once('error', error => { spawnError = error; resolve(); });
  });
  try {
    const deadline = Date.now() + 30_000;
    while (true) {
      if (spawnError) throw spawnError;
      if (server.exitCode !== null) throw new Error('Preview server stopped: ' + output);
      // Wait for our own process to announce its URL before checking HTTP.
      if (stripVTControlCharacters(output).includes(address)) {
        try {
          const response = await fetch(address, { signal: AbortSignal.timeout(1000) });
          if (response.ok) break;
        } catch { /* The server may still be starting. */ }
      }
      if (Date.now() > deadline) throw new Error('Preview server timeout: ' + output);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    server.kill();
    await stopped;
    throw error;
  }
  return async () => {
    server.kill();
    await stopped;
  };
}
