const { app, BrowserWindow, ipcMain, Menu, Tray, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// i18n for main process - will be updated when language changes
let currentLang = 'en'; // will be set after config loads

// i18n for main process
const i18n = {
  en: {
    editMotto: 'Edit Motto (Cmd+E)',
    switchTheme: 'Switch Theme (Cmd+T)',
    windowLevel: 'Window Level',
    minimizedLayer: 'Background (Translucent)',
    normalLayer: 'Normal (Interactive)',
    floatingLayer: 'Always on Top',
    hideWindow: 'Hide Window',
    showWindow: 'Show Window',
    resetPosition: 'Reset Position',
    about: 'About ChiefMotto',
    quit: 'Quit',
    trayTooltip: 'ChiefMotto',
    showHide: 'Show/Hide',
    transparentLayer: 'Transparent (Click-through)',
    quitApp: 'Quit ChiefMotto',
    defaultMotto: 'Focus on what matters',
    language: 'Language',
    langEnglish: 'English',
    langChinese: '中文 (Chinese)'
  },
  zh: {
    editMotto: '编辑座右铭 (Cmd+E)',
    switchTheme: '切换主题 (Cmd+T)',
    windowLevel: '窗口层级',
    minimizedLayer: '背景层（半透明）',
    normalLayer: '普通层（可交互）',
    floatingLayer: '始终最上层',
    hideWindow: '隐藏窗口',
    showWindow: '显示窗口',
    resetPosition: '重置位置',
    about: '关于 ChiefMotto',
    quit: '退出',
    trayTooltip: 'ChiefMotto - 座右铭',
    showHide: '显示/隐藏',
    transparentLayer: '透明层（鼠标穿透）',
    quitApp: '退出 ChiefMotto',
    defaultMotto: '专注重要之事',
    language: '语言',
    langEnglish: 'English (英文)',
    langChinese: '中文'
  }
};

function t(key) {
  return i18n[currentLang][key] || key;
}

// 简单的配置存储
class SimpleStore {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.data = this.load();
    this.isDirty = false;
  }

  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        // Set language from config or detect from system
        if (config.language) {
          currentLang = config.language;
        } else {
          const systemLocale = app.getLocale();
          // Default to Chinese for better local user experience
          currentLang = systemLocale.startsWith('zh') ? 'zh' : 'zh';
          config.language = currentLang;
        }
        return config;
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
    // Default to Chinese for first launch
    currentLang = 'zh';
    return {
      windowPosition: { x: 50, y: 50 },
      windowSize: { width: 300, height: 100 },
      motto: t('defaultMotto'),
      theme: 'glass',
      windowLevel: 'normal', // 'minimized', 'normal', 'floating'
      language: currentLang
    };
  }

  save() {
    if (!this.isDirty) return;

    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2));
      this.isDirty = false;
    } catch (err) {
      console.error('Failed to save config:', err);
      throw err;
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.isDirty = true;
  }
}

const store = new SimpleStore();
let mainWindow;
let tray;
let modalState = {
  isOpen: false,
  originalBounds: null,
  restoreListener: null
};
let currentWindowLevel = 'normal';

// 应用窗口层级设置
function applyWindowLevel(level) {
  if (!mainWindow || modalState.isOpen) return;

  currentWindowLevel = level;
  store.set('windowLevel', level);
  store.save();

  switch (level) {
    case 'minimized':
      // 最小化层 - 视觉淡化，提示用户这是背景
      mainWindow.setAlwaysOnTop(false);
      // 不设置 setIgnoreMouseEvents，保留右键菜单功能
      mainWindow.setOpacity(0.4);
      if (process.platform === 'darwin') {
        mainWindow.setWindowButtonVisibility(false);
      }
      break;
    case 'normal':
      // 普通层 - 可以被遮挡，可以交互
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setOpacity(1.0);
      if (process.platform === 'darwin') {
        mainWindow.setWindowButtonVisibility(false);
      }
      break;
    case 'floating':
      // 浮动层 - 始终在最上层
      mainWindow.setAlwaysOnTop(true, 'floating');
      mainWindow.setOpacity(1.0);
      break;
  }

  updateTrayMenu();
}

// 设置为桌面层级（已废弃，保留兼容）
function setDesktopLevel() {
  applyWindowLevel('normal');
}

// 设置为普通层级（用于编辑）
function setNormalLevel() {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setOpacity(1.0);
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  let savedPosition = store.get('windowPosition');
  let savedSize = store.get('windowSize');

  // Validate and fix window position for multi-monitor support
  // Ensure entire window is visible on screen
  if (!savedPosition || typeof savedPosition.x !== 'number' || typeof savedPosition.y !== 'number') {
    // Default to elegant position: right side, upper area
    savedPosition = {
      x: Math.floor(screenWidth * 0.65),
      y: Math.floor(screenHeight * 0.25)
    };
  }
  if (!savedSize || typeof savedSize.width !== 'number' || typeof savedSize.height !== 'number') {
    savedSize = { width: 300, height: 100 };
  }

  // Check all displays to see if window is on any of them
  const displays = screen.getAllDisplays();
  let isPositionValid = false;

  for (const display of displays) {
    const { x, y, width, height } = display.workArea;
    // Check if at least 50% of window is visible on this display
    const windowCenterX = savedPosition.x + savedSize.width / 2;
    const windowCenterY = savedPosition.y + savedSize.height / 2;

    if (windowCenterX >= x && windowCenterX < x + width &&
        windowCenterY >= y && windowCenterY < y + height) {
      isPositionValid = true;
      break;
    }
  }

  // If position is invalid, reset to elegant default position
  if (!isPositionValid) {
    savedPosition.x = Math.floor(screenWidth * 0.65);
    savedPosition.y = Math.floor(screenHeight * 0.25);
    store.set('windowPosition', savedPosition);
  }

  mainWindow = new BrowserWindow({
    width: savedSize.width,
    height: savedSize.height,
    x: savedPosition.x,
    y: savedPosition.y,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: false,
    hasShadow: true,
    skipTaskbar: true,
    acceptFirstMouse: true,
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      enablePreferredSizeMode: false
    }
  });

  // 设置窗口在所有桌面空间显示
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // 初始设置为桌面层
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  mainWindow.loadFile('index.html');

  // 窗口加载完成后应用保存的层级设置
  mainWindow.webContents.on('did-finish-load', () => {
    const savedLevel = store.get('windowLevel') || 'desktop';
    applyWindowLevel(savedLevel);
  });

  // 保存窗口位置（防抖）
  let savePositionTimer;
  mainWindow.on('moved', () => {
    // 如果弹窗打开，更新原始位置
    if (modalState.isOpen) {
      const position = mainWindow.getPosition();
      modalState.originalBounds.x = position[0];
      modalState.originalBounds.y = position[1];
    } else {
      clearTimeout(savePositionTimer);
      savePositionTimer = setTimeout(() => {
        const position = mainWindow.getPosition();
        store.set('windowPosition', { x: position[0], y: position[1] });
      }, 1000);
    }
  });

  // 窗口关闭时隐藏而非退出
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建右键菜单
  mainWindow.webContents.on('context-menu', (e, params) => {
    const isVisible = mainWindow.isVisible();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: t('editMotto'),
        accelerator: 'CmdOrCtrl+E',
        click: () => {
          openModal('edit', 500, 450);
        }
      },
      {
        label: t('switchTheme'),
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          openModal('theme', 500, 700);
        }
      },
      { type: 'separator' },
      {
        label: t('language'),
        submenu: [
          {
            label: t('langEnglish'),
            type: 'radio',
            checked: currentLang === 'en',
            click: () => {
              changeLanguage('en');
            }
          },
          {
            label: t('langChinese'),
            type: 'radio',
            checked: currentLang === 'zh',
            click: () => {
              changeLanguage('zh');
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: t('windowLevel'),
        submenu: [
          {
            label: t('minimizedLayer'),
            type: 'radio',
            checked: currentWindowLevel === 'minimized',
            click: () => applyWindowLevel('minimized')
          },
          {
            label: t('normalLayer'),
            type: 'radio',
            checked: currentWindowLevel === 'normal',
            click: () => applyWindowLevel('normal')
          },
          {
            label: t('floatingLayer'),
            type: 'radio',
            checked: currentWindowLevel === 'floating',
            click: () => applyWindowLevel('floating')
          }
        ]
      },
      { type: 'separator' },
      {
        label: isVisible ? t('hideWindow') : t('showWindow'),
        click: () => {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        }
      },
      { type: 'separator' },
      {
        label: t('resetPosition'),
        click: () => {
          mainWindow.setPosition(50, 50);
          store.set('windowPosition', { x: 50, y: 50 });
        }
      },
      { type: 'separator' },
      {
        label: t('about'),
        click: () => {
          openModal('about', 450, 550);
        }
      },
      { type: 'separator' },
      {
        label: t('quit'),
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    contextMenu.popup();
  });
}

// 统一的弹窗打开函数
function openModal(type, width, height) {
  if (modalState.isOpen) {
    closeModal();
  }

  modalState.originalBounds = mainWindow.getBounds();
  modalState.isOpen = true;

  // 切换到普通窗口层级，支持输入
  setNormalLevel();

  mainWindow.setSize(width, height);
  mainWindow.center();

  mainWindow.webContents.send(`show-${type}`);

  if (modalState.restoreListener) {
    ipcMain.removeListener('modal-closed', modalState.restoreListener);
  }

  modalState.restoreListener = () => {
    closeModal();
  };

  ipcMain.once('modal-closed', modalState.restoreListener);
}

// 统一的弹窗关闭函数
function closeModal() {
  if (!modalState.isOpen || !modalState.originalBounds) return;

  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setSize(modalState.originalBounds.width, modalState.originalBounds.height);
      mainWindow.setPosition(modalState.originalBounds.x, modalState.originalBounds.y);

      // 恢复用户设置的层级
      applyWindowLevel(currentWindowLevel);
    }

    modalState.isOpen = false;
    modalState.originalBounds = null;
  }, 200);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

function createTray() {
  // 使用 Template 命名约定的图标（macOS 会自动处理颜色）
  const templatePath = path.join(__dirname, 'tray-icon-Template.png');
  const normalPath = path.join(__dirname, 'tray-icon.png');

  let trayIcon;
  if (fs.existsSync(templatePath)) {
    trayIcon = nativeImage.createFromPath(templatePath);
    trayIcon.setTemplateImage(true);
  } else if (fs.existsSync(normalPath)) {
    trayIcon = nativeImage.createFromPath(normalPath);
    trayIcon.setTemplateImage(true);
  } else {
    // 创建一个简单的空图标
    const canvas = nativeImage.createEmpty();
    trayIcon = canvas;
  }

  tray = new Tray(trayIcon);
  tray.setToolTip(t('trayTooltip'));

  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'ChiefMotto',
      enabled: false
    },
    { type: 'separator' },
    {
      label: t('showHide'),
      click: () => {
        if (mainWindow && mainWindow.isVisible()) {
          mainWindow.hide();
        } else if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: t('editMotto'),
      accelerator: 'CmdOrCtrl+E',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          openModal('edit', 500, 450);
        }
      }
    },
    {
      label: t('switchTheme'),
      accelerator: 'CmdOrCtrl+T',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          openModal('theme', 500, 700);
        }
      }
    },
    { type: 'separator' },
    {
      label: t('language'),
      submenu: [
        {
          label: t('langEnglish'),
          type: 'radio',
          checked: currentLang === 'en',
          click: () => {
            changeLanguage('en');
          }
        },
        {
          label: t('langChinese'),
          type: 'radio',
          checked: currentLang === 'zh',
          click: () => {
            changeLanguage('zh');
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: t('windowLevel'),
      submenu: [
        {
          label: t('transparentLayer'),
          type: 'radio',
          checked: currentWindowLevel === 'minimized',
          click: () => applyWindowLevel('minimized')
        },
        {
          label: t('normalLayer'),
          type: 'radio',
          checked: currentWindowLevel === 'normal',
          click: () => applyWindowLevel('normal')
        },
        {
          label: t('floatingLayer'),
          type: 'radio',
          checked: currentWindowLevel === 'floating',
          click: () => applyWindowLevel('floating')
        }
      ]
    },
    { type: 'separator' },
    {
      label: t('about'),
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          openModal('about', 450, 550);
        }
      }
    },
    { type: 'separator' },
    {
      label: t('quitApp'),
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// Mac 特性：关闭窗口不退出应用
app.on('window-all-closed', () => {
  // 不调用 app.quit()，保持应用运行
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// 退出前强制保存配置
app.on('before-quit', () => {
  app.isQuitting = true;
  // 强制保存，即使 isDirty 为 false
  try {
    const dir = path.dirname(store.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(store.configPath, JSON.stringify(store.data, null, 2));
  } catch (err) {
    console.error('Failed to save config on quit:', err);
  }
});

// IPC 通信
ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('modal-closed', () => {
  // 由 modalState.restoreListener 处理
});

// 自适应窗口大小
ipcMain.on('resize-window', (event, size) => {
  if (mainWindow && !modalState.isOpen) {
    mainWindow.setSize(size.width, size.height);
    store.set('windowSize', size);
  }
});

// 获取当前语言
ipcMain.handle('get-language', () => {
  return store.get('language') || currentLang;
});

// 获取座右铭
ipcMain.handle('get-motto', () => {
  return store.get('motto');
});

// 保存座右铭
ipcMain.handle('save-motto', async (event, motto) => {
  try {
    store.set('motto', motto);
    store.save();
    return { success: true };
  } catch (err) {
    console.error('Failed to save motto:', err);
    return { success: false, error: err.message };
  }
});

// 获取主题
ipcMain.handle('get-theme', () => {
  return store.get('theme') || 'glass';
});

// 保存主题
ipcMain.handle('save-theme', async (event, theme) => {
  try {
    store.set('theme', theme);
    store.save();
    return { success: true };
  } catch (err) {
    console.error('Failed to save theme:', err);
    return { success: false, error: err.message };
  }
});

// Change language
function changeLanguage(lang) {
  currentLang = lang;
  store.set('language', lang);
  store.save();

  // Update tray and menus
  updateTrayMenu();

  // Notify frontend to reload
  if (mainWindow) {
    mainWindow.webContents.send('change-language', lang);
  }
}
