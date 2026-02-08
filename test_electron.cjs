// Try using process.electronBinding or electron's internal module path
console.log('[Test] Starting script...');

// Try to access the electron built-in module directly
try {
    // Electron should provide its built-in modules via a special protocol
    const electron = process._linkedBinding ? process._linkedBinding('electron_common_features') : null;
    console.log('[Test] _linkedBinding:', electron);
} catch (e) {
    console.log('[Test] _linkedBinding error:', e.message);
}

// Try to use require with the builtin protocol
try {
    const electronModule = require('electron/main');
    console.log('[Test] electron/main:', electronModule);
} catch (e) {
    console.log('[Test] electron/main error:', e.message);
}

// Check if we can access electron's window global
console.log('[Test] process.type:', process.type);
console.log('[Test] global.electron:', global.electron);

// Since we're in main process of electron, there should be internal modules available
// Let's try the binding approach
if (process.type === 'browser') {
    console.log('[Test] We are in browser/main process');
}
