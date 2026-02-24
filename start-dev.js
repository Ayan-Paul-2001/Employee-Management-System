const { spawn } = require('child_process');
const path = require('path');

// Helper function to run a command in a specific directory
const runCommand = (command, args, cwd, name, colorCode) => {
    const child = spawn(command, args, {
        cwd,
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, FORCE_COLOR: '1' }
    });

    // Helper to format output
    const formatOutput = (data, isError = false) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                // Determine prefix based on color code
                // Standard colors: Reset = "\x1b[0m", Red = "\x1b[31m", Green = "\x1b[32m", Yellow = "\x1b[33m", Blue = "\x1b[34m", Magenta = "\x1b[35m", Cyan = "\x1b[36m"
                const prefix = `\x1b[${colorCode}m[${name}]\x1b[0m`;
                const stream = isError ? process.stderr : process.stdout;
                stream.write(`${prefix} ${line}\n`);
            }
        });
    };

    child.stdout.on('data', (data) => formatOutput(data));
    child.stderr.on('data', (data) => formatOutput(data, true));

    child.on('error', (error) => {
        console.error(`\x1b[${colorCode}m[${name}] FAILED TO START: ${error.message}\x1b[0m`);
    });

    child.on('close', (code) => {
        console.log(`\x1b[${colorCode}m[${name}] exited with code ${code}\x1b[0m`);
    });

    return child;
};

const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

console.log('Starting Backend and Frontend...');

// Start Backend (Green)
// Adjust command 'npm run start:dev' based on backend/package.json
const backend = runCommand('npm', ['run', 'start:dev'], backendPath, 'BACKEND', '32');

// Start Frontend (Cyan)
// Adjust command 'npm run dev' based on frontend/package.json
const frontend = runCommand('npm', ['run', 'dev'], frontendPath, 'FRONTEND', '36');

// Handle process termination to kill children
const cleanup = () => {
    console.log('\nStopping services...');
    // Kill processes
    try {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
            spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
        } else {
            backend.kill();
            frontend.kill();
        }
    } catch (e) {
        console.error('Error stopping processes:', e);
    }
    // Give taskkill a moment to initiate before exiting
    setTimeout(() => process.exit(), 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
