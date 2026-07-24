const { app, session, BrowserWindow } = require('electron');
const path = require('path');
app.whenReady().then(async () => {
  try {
    const extractPath = path.join(app.getPath('userData'), 'extensions', 'cjpalhdlnbpafiamejdnhcphjbkeiagm');
    const extInfo = await session.defaultSession.loadExtension(extractPath);
    console.log('Success!', extInfo.name);
  } catch (e) {
    console.error('FAILED:', e.message);
  }
  app.quit();
});
