let currentMotto = '';
let currentTheme = 'glass';
let isAnimationComplete = false;
let isFirstLaunch = false;
let userLang = 'en'; // default to English

// Animation and timing constants
const ANIMATION_DELAYS = {
  WELCOME: 1000,           // Welcome modal delay
  MODAL_CLOSE: 300,        // Modal close notification delay
  INPUT_FOCUS: 300,        // Input focus delay after modal open
  THEME_SWITCH: 350,       // Theme switch window resize delay
  WINDOW_RESIZE: 100       // Window resize debounce
};

const TOAST_DURATIONS = {
  SUCCESS: 1500,           // Success toast duration
  SHORT: 2000,             // Short toast duration
  LONG: 2500,              // Long toast duration
  ERROR: 3000              // Error toast duration
};

const MODAL_SIZES = {
  EDIT_WIDTH: 450,         // Edit modal width
  THEME_WIDTH: 500,        // Theme modal width
  INSPIRATION_WIDTH: 700   // Inspiration modal width
};

const INPUT_LIMITS = {
  MAX_CHARS: 100,          // Maximum motto characters
  WARNING_THRESHOLD: 90    // Character count warning threshold
};

// Safe localStorage wrapper
const safeLocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage.getItem failed:', e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('localStorage.setItem failed:', e);
      return false;
    }
  }
};

// Load language from main process
async function detectLanguage() {
  if (window.electronAPI && window.electronAPI.getLanguage) {
    try {
      const savedLang = await window.electronAPI.getLanguage();
      if (savedLang === 'en' || savedLang === 'zh') {
        userLang = savedLang;
        return;
      }
    } catch (e) {
      console.error('Failed to load language:', e);
    }
  }

  // Default to Chinese for better local user experience
  userLang = 'zh';
}

// Apply language change
function setLanguage(lang) {
  userLang = lang;
  // Reload page to apply static text updates
  location.reload();
}

const languageReady = detectLanguage();
window.languageReady = languageReady;

languageReady.then(() => {
  setTimeout(() => {
    isAnimationComplete = true;
    checkFirstLaunch();
  }, 400);
});

// i18n text content
const i18n = {
  en: {
    welcomeTitle: 'Welcome to ChiefMotto',
    welcomeTips: 'Your personal motivation companion<br><br>• Right-click to edit your motto<br>• Press Cmd+E for quick edit<br>• Press Cmd+T to switch themes<br>• Drag to position anywhere',
    welcomeButton: 'Get Started',
    editTitle: 'Edit Motto',
    editHint: '100 characters max',
    editPlaceholder: 'Enter your motto',
    editSave: 'Save',
    editCancel: 'Cancel',
    themeTitle: 'Choose Theme',
    themeHint: 'Select your visual style',
    aboutTitle: 'ChiefMotto',
    aboutVersion: 'Version 1.0.0',
    aboutSlogan: 'Keep your focus, every single day',
    aboutDesc: 'A minimal desktop motto app that helps you stay focused on what truly matters.',
    currentMottoLabel: 'Current Motto',
    usageText: 'Used for {days} days',
    usageDaySingular: 'Used for 1 day',
    usageToday: 'Just started today',
    closeHint: 'Press Esc to close',
    closeButton: 'Close',
    keyEnter: '↵',
    keyEsc: 'Esc',
    toastSaved: 'Saved',
    toastEmpty: 'Motto cannot be empty',
    toastTooLong: '100 characters max',
    toastLoadFailed: 'Failed to load, please restart',
    toastSaveFailed: 'Failed to save, please retry',
    toastQuitFailed: 'Cannot quit, press Cmd+Q or use menu',
    hintText: 'Right-click to edit (Cmd+E) or switch theme (Cmd+T)',
    charCounter: '{current} / 100',
    contactTitle: '💡 Like this app?',
    contactDesc: 'Get in touch for updates and more tools',
    copyWechat: 'Copy WeChat',
    copyEmail: 'Copy Email',
    wechatHint: 'Search and add on WeChat',
    needInspiration: '💡 Need inspiration?',
    inspirationTitle: 'Featured Mottos',
    inspirationHint: 'Click any motto to use it',
    inspirationCategories: {
      focus: 'Focus',
      courage: 'Courage',
      wisdom: 'Wisdom',
      growth: 'Growth'
    },
    exampleMottos: {
      focus: [
        'Focus on what matters',
        'Less is more',
        'Depth over breadth'
      ],
      courage: [
        'Action beats perfection',
        'Do what\'s hard and right',
        'Start brave, stay wise'
      ],
      wisdom: [
        'Simplicity is the ultimate sophistication',
        'Slow is smooth, smooth is fast',
        'First things first'
      ],
      growth: [
        'Get 1% better every day',
        'Learn forever, grow forever',
        'Stay curious, embrace change'
      ]
    },
    themeNames: {
      glass: 'Glass',
      vintage: 'Vintage',
      gift: 'Gift Card',
      minimal: 'Minimal',
      rainbow: 'Rainbow',
      neon: 'Neon',
      wood: 'Wood',
      sakura: 'Sakura'
    },
    themePreviews: {
      glass: 'Modern & Clean',
      vintage: 'Nostalgic',
      gift: 'Warm',
      minimal: 'Simple',
      rainbow: 'Colorful',
      neon: 'Futuristic',
      wood: 'Natural',
      sakura: 'Romantic'
    }
  },
  zh: {
    welcomeTitle: '欢迎使用 ChiefMotto',
    welcomeTips: '你的专属激励伙伴<br><br>• 右键点击可编辑座右铭<br>• 按 Cmd+E 快速编辑<br>• 按 Cmd+T 切换主题<br>• 拖动到任意位置',
    welcomeButton: '开始使用',
    editTitle: '编辑座右铭',
    editHint: '最多 100 个字符',
    editPlaceholder: '请输入你的座右铭',
    editSave: '保存',
    editCancel: '取消',
    themeTitle: '选择主题',
    themeHint: '选择你喜欢的视觉风格',
    aboutTitle: 'ChiefMotto',
    aboutVersion: '版本 1.0.0',
    aboutSlogan: '每一天，专注重要之事',
    aboutDesc: '一个简洁的桌面座右铭应用，帮助你专注于真正重要的事情。',
    currentMottoLabel: '当前座右铭',
    usageText: '已使用 {days} 天',
    usageDaySingular: '已使用 1 天',
    usageToday: '今天刚开始使用',
    closeHint: '按 Esc 关闭',
    closeButton: '关闭',
    keyEnter: '↵',
    keyEsc: 'Esc',
    toastSaved: '保存成功',
    toastEmpty: '座右铭不能为空',
    toastTooLong: '最多 100 个字符',
    toastLoadFailed: '加载失败，请尝试重启应用',
    toastSaveFailed: '保存失败，请重试',
    toastQuitFailed: '无法退出，请按 Cmd+Q 或右键菜单退出',
    hintText: '右键编辑 (Cmd+E) 或切换主题 (Cmd+T)',
    charCounter: '{current} / 100',
    contactTitle: '💡 喜欢这个应用？',
    contactDesc: '联系作者获取更多 AI 工具和产品更新',
    copyWechat: '复制微信号',
    copyEmail: '复制邮箱',
    wechatHint: '复制后在微信中搜索添加',
    needInspiration: '💡 需要灵感？',
    inspirationTitle: '精选座右铭',
    inspirationHint: '点击任意座右铭即可使用',
    inspirationCategories: {
      focus: '专注力',
      courage: '勇气',
      wisdom: '智慧',
      growth: '成长'
    },
    exampleMottos: {
      focus: [
        '专注重要之事',
        '少即是多',
        '深度优于广度'
      ],
      courage: [
        '行动胜于空想',
        '做难而正确的事',
        '勇敢开始，智慧坚持'
      ],
      wisdom: [
        '简单是终极的复杂',
        '慢即是快',
        '要事第一'
      ],
      growth: [
        '每天进步 1%',
        '持续学习，终身成长',
        '拥抱变化，保持好奇'
      ]
    },
    themeNames: {
      glass: '毛玻璃',
      vintage: '复古纸张',
      gift: '礼物卡片',
      minimal: '极简黑白',
      rainbow: '渐变彩虹',
      neon: '霓虹灯',
      wood: '木纹',
      sakura: '樱花'
    },
    themePreviews: {
      glass: '现代简约',
      vintage: '怀旧典雅',
      gift: '温馨祝福',
      minimal: '简洁有力',
      rainbow: '活力多彩',
      neon: '科技未来',
      wood: '自然质朴',
      sakura: '浪漫温柔'
    }
  }
};

function t(key) {
  const keys = key.split('.');
  let value = i18n[userLang];
  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }
  return value;
}

function showToast(message, type = 'success', duration = TOAST_DURATIONS.LONG) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function checkFirstLaunch() {
  // Check if first launch and save timestamp
  if (!safeLocalStorage.getItem('launched')) {
    safeLocalStorage.setItem('launched', 'true');
    safeLocalStorage.setItem('firstLaunchDate', new Date().toISOString());
    isFirstLaunch = true;
    setTimeout(() => {
      showWelcome();
    }, ANIMATION_DELAYS.WELCOME);
  } else if (!safeLocalStorage.getItem('firstLaunchDate')) {
    // For existing users without firstLaunchDate
    safeLocalStorage.setItem('firstLaunchDate', new Date().toISOString());
  }
}

function updateUsageStats() {
  const firstLaunchDate = safeLocalStorage.getItem('firstLaunchDate');
  if (firstLaunchDate) {
    try {
      const first = new Date(firstLaunchDate);
      const now = new Date();

      // Validate dates
      if (isNaN(first.getTime()) || first > now) {
        // Invalid date, reset to today
        safeLocalStorage.setItem('firstLaunchDate', now.toISOString());
        document.getElementById('usageText').textContent = t('usageToday');
        return;
      }

      const diffTime = Math.abs(now - first);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const usageTextElement = document.getElementById('usageText');
      if (diffDays === 0) {
        usageTextElement.textContent = t('usageToday');
      } else if (diffDays === 1) {
        usageTextElement.textContent = t('usageDaySingular');
      } else {
        usageTextElement.textContent = t('usageText').replace('{days}', diffDays);
      }
    } catch (e) {
      console.error('Failed to update usage stats:', e);
      document.getElementById('usageText').textContent = t('usageToday');
    }
  } else {
    document.getElementById('usageText').textContent = t('usageToday');
  }
}

function showWelcome() {
  const welcomeHtml = `
    <div id="welcomeOverlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.95);
        padding: 40px;
        border-radius: 20px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">👋</div>
        <h2 style="font-size: 24px; margin-bottom: 15px; color: #333;">${t('welcomeTitle')}</h2>
        <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
          ${t('welcomeTips')}
        </p>
        <button onclick="closeWelcome()" style="
          background: #007AFF;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.background='#0051D5'" onmouseout="this.style.background='#007AFF'">
          ${t('welcomeButton')}
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', welcomeHtml);
}

window.closeWelcome = function() {
  const overlay = document.getElementById('welcomeOverlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), ANIMATION_DELAYS.MODAL_CLOSE);
  }
};

async function loadMotto() {
  if (window.electronAPI && window.electronAPI.getMotto) {
    try {
      currentMotto = await window.electronAPI.getMotto();
      if (!currentMotto) {
        currentMotto = userLang === 'zh' ? '专注重要之事' : 'Focus on what matters';
      }
      document.getElementById('mottoText').textContent = currentMotto;
      document.getElementById('aboutMottoText').textContent = currentMotto;
      document.fonts.ready.then(() => {
        adjustWindowSize();
      });
    } catch (err) {
      console.error('Failed to load motto:', err);
      showToast(t('toastLoadFailed'), 'error', TOAST_DURATIONS.ERROR);
    }
  }
}

async function loadTheme() {
  if (window.electronAPI && window.electronAPI.getTheme) {
    try {
      currentTheme = await window.electronAPI.getTheme();
      applyTheme(currentTheme, false);
    } catch (err) {
      console.error('Failed to load theme:', err);
    }
  }
}

function applyTheme(theme, animate = true) {
  const body = document.body;

  if (animate) {
    body.style.transition = 'opacity 0.2s ease';
    body.style.opacity = '0';

    setTimeout(() => {
      body.className = `theme-${theme}`;
      currentTheme = theme;

      document.querySelectorAll('.theme-card').forEach(card => {
        const checkmark = card.querySelector('.theme-checkmark');
        if (card.dataset.theme === theme) {
          card.classList.add('active');
          if (checkmark) checkmark.style.display = 'flex';
        } else {
          card.classList.remove('active');
          if (checkmark) checkmark.style.display = 'none';
        }
      });

      body.style.opacity = '1';
      setTimeout(() => {
        body.style.transition = '';
      }, 200);
    }, 100);
  } else {
    body.className = `theme-${theme}`;
    currentTheme = theme;

    document.querySelectorAll('.theme-card').forEach(card => {
      const checkmark = card.querySelector('.theme-checkmark');
      if (card.dataset.theme === theme) {
        card.classList.add('active');
        if (checkmark) checkmark.style.display = 'flex';
      } else {
        card.classList.remove('active');
        if (checkmark) checkmark.style.display = 'none';
      }
    });
  }
}

async function initializeApp() {
  await languageReady;
  await loadTheme();
  await loadMotto();
}

initializeApp();

// Debounced window size adjustment to avoid excessive resizing
let adjustWindowSizeTimer = null;
function adjustWindowSize() {
  clearTimeout(adjustWindowSizeTimer);
  adjustWindowSizeTimer = setTimeout(() => {
    const container = document.querySelector('.container');
    if (!container) return;

    requestAnimationFrame(() => {
      const windowWidth = Math.min(Math.max(container.offsetWidth, 200), 600);
      const windowHeight = container.offsetHeight;
      if (window.electronAPI && window.electronAPI.resizeWindow) {
        window.electronAPI.resizeWindow({
          width: Math.ceil(windowWidth),
          height: Math.ceil(windowHeight)
        });
      }
    });
  }, ANIMATION_DELAYS.WINDOW_RESIZE);
}

document.getElementById('closeBtn').addEventListener('click', function(e) {
  const btn = e.currentTarget;
  btn.style.transform = 'scale(0.8)';
  setTimeout(() => {
    if (window.electronAPI && window.electronAPI.quitApp) {
      window.electronAPI.quitApp();
    } else {
      btn.style.transform = '';
      showToast(t('toastQuitFailed'), 'error', TOAST_DURATIONS.ERROR);
    }
  }, 150);
});

function showEdit() {
  if (!isAnimationComplete) {
    setTimeout(showEdit, ANIMATION_DELAYS.MODAL_CLOSE);
    return;
  }
  const modal = document.getElementById('editModal');
  const input = document.getElementById('mottoInput');
  input.value = currentMotto;
  updateCharCounter();
  modal.classList.add('show');

  setTimeout(() => {
    input.focus();
    // Move cursor to end instead of selecting all to avoid IME issues
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }, ANIMATION_DELAYS.INPUT_FOCUS);
}

function closeEdit() {
  const modal = document.getElementById('editModal');
  const input = document.getElementById('mottoInput');
  modal.classList.remove('show');

  input.value = currentMotto;
  input.classList.remove('error');
  updateCharCounter();
  document.getElementById('editSaveBtn').disabled = false;
  document.getElementById('editSaveBtn').classList.remove('loading');

  notifyModalClosed();
}

function updateCharCounter() {
  const input = document.getElementById('mottoInput');
  const counter = document.getElementById('charCounter');
  const saveBtn = document.getElementById('editSaveBtn');

  // Use emoji-aware character counting
  const length = Array.from(input.value).length;

  counter.textContent = t('charCounter').replace('{current}', length);
  counter.classList.remove('warning', 'error');
  if (length > INPUT_LIMITS.WARNING_THRESHOLD) counter.classList.add('warning');
  if (length > INPUT_LIMITS.MAX_CHARS) counter.classList.add('error');
  saveBtn.disabled = length === 0 || length > INPUT_LIMITS.MAX_CHARS;

  // Enforce hard limit at 100 characters
  if (length > INPUT_LIMITS.MAX_CHARS) {
    const chars = Array.from(input.value);
    input.value = chars.slice(0, INPUT_LIMITS.MAX_CHARS).join('');
    // Recursively update to reflect the truncation
    updateCharCounter();
  }
}

async function saveMotto() {
  const input = document.getElementById('mottoInput');
  const saveBtn = document.getElementById('editSaveBtn');
  let newMotto = input.value.trim();

  // Remove line breaks and normalize whitespace
  newMotto = newMotto.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!newMotto) {
    input.classList.add('error');
    showToast(t('toastEmpty'), 'warning', TOAST_DURATIONS.SHORT);
    setTimeout(() => input.classList.remove('error'), ANIMATION_DELAYS.MODAL_CLOSE);
    return;
  }

  // Check character length (emoji-aware)
  const charLength = Array.from(newMotto).length;
  if (charLength > INPUT_LIMITS.MAX_CHARS) {
    input.classList.add('error');
    showToast(t('toastTooLong'), 'warning', TOAST_DURATIONS.SHORT);
    setTimeout(() => input.classList.remove('error'), ANIMATION_DELAYS.MODAL_CLOSE);
    return;
  }

  if (newMotto === currentMotto) {
    closeEdit();
    return;
  }

  saveBtn.disabled = true;
  saveBtn.classList.add('loading');

  try {
    if (window.electronAPI && window.electronAPI.saveMotto) {
      const result = await window.electronAPI.saveMotto(newMotto);
      if (result && result.success) {
        currentMotto = newMotto;
        document.getElementById('mottoText').textContent = currentMotto;
        document.getElementById('aboutMottoText').textContent = currentMotto;
        closeEdit();
        showToast(t('toastSaved'), 'success', TOAST_DURATIONS.SUCCESS);
        // Adjust window size immediately for better responsiveness
        requestAnimationFrame(() => {
          adjustWindowSize();
        });
      } else {
        throw new Error(result?.error || 'Save failed');
      }
    }
  } catch (err) {
    console.error('Failed to save motto:', err);
    showToast(t('toastSaveFailed'), 'error', TOAST_DURATIONS.SHORT);
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

function showTheme() {
  if (!isAnimationComplete) {
    setTimeout(showTheme, ANIMATION_DELAYS.MODAL_CLOSE);
    return;
  }

  document.querySelectorAll('.theme-card').forEach(card => {
    const checkmark = card.querySelector('.theme-checkmark');
    if (card.dataset.theme === currentTheme) {
      card.classList.add('active');
      if (checkmark) checkmark.style.display = 'flex';
    } else {
      card.classList.remove('active');
      if (checkmark) checkmark.style.display = 'none';
    }
  });

  document.getElementById('themeModal').classList.add('show');
}

function closeTheme() {
  document.getElementById('themeModal').classList.remove('show');
  notifyModalClosed();
}

// Inspiration modal
function showInspiration() {
  const modal = document.getElementById('inspirationModal');
  const content = document.getElementById('inspirationContent');

  // Build categories
  let html = '';
  const categories = ['focus', 'courage', 'wisdom', 'growth'];
  categories.forEach(cat => {
    html += `<div style="margin-bottom: 25px;">`;
    html += `<h3 style="font-size: 14px; color: #007AFF; margin-bottom: 10px; font-weight: 600;">${t('inspirationCategories.' + cat)}</h3>`;
    const mottos = t('exampleMottos.' + cat);
    mottos.forEach(motto => {
      html += `<div class="inspiration-item" style="padding: 10px 15px; margin: 5px 0; background: rgba(0,122,255,0.05); border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent;"
        onmouseover="this.style.background='rgba(0,122,255,0.1)'; this.style.borderColor='#007AFF';"
        onmouseout="this.style.background='rgba(0,122,255,0.05)'; this.style.borderColor='transparent';"
        onclick="useInspiration('${motto.replace(/'/g, "\\'")}')">
        ${motto}
      </div>`;
    });
    html += `</div>`;
  });

  content.innerHTML = html;
  modal.classList.add('show');
}

function closeInspiration() {
  document.getElementById('inspirationModal').classList.remove('show');
}

window.useInspiration = function(motto) {
  const input = document.getElementById('mottoInput');
  input.value = motto;
  updateCharCounter();
  closeInspiration();

  // Focus input after modal close animation completes
  setTimeout(() => {
    input.focus();
    input.select(); // Also select the text for easy editing
  }, ANIMATION_DELAYS.THEME_SWITCH);
};

async function selectTheme(theme, card) {
  card.style.opacity = '0.6';
  card.style.pointerEvents = 'none';

  try {
    if (window.electronAPI && window.electronAPI.saveTheme) {
      const result = await window.electronAPI.saveTheme(theme);
      if (result && result.success) {
        applyTheme(theme, true);
        const themeName = t(`themeNames.${theme}`);
        showToast(`${userLang === 'zh' ? '已切换到「' : 'Switched to '}${themeName}${userLang === 'zh' ? '」' : ''}`, 'success', TOAST_DURATIONS.SUCCESS);

        closeTheme();

        // Adjust window size immediately for better responsiveness
        requestAnimationFrame(() => {
          adjustWindowSize();
        });
      }
    }
  } catch (err) {
    console.error('Failed to save theme:', err);
    showToast(t('toastSaveFailed'), 'error', TOAST_DURATIONS.SHORT);
  } finally {
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
  }
}

function showAbout() {
  if (!isAnimationComplete) {
    setTimeout(showAbout, ANIMATION_DELAYS.MODAL_CLOSE);
    return;
  }
  document.getElementById('aboutModal').classList.add('show');
}

function closeAbout() {
  document.getElementById('aboutModal').classList.remove('show');
  notifyModalClosed();
}

function notifyModalClosed() {
  if (window.electronAPI && window.electronAPI.notifyModalClosed) {
    setTimeout(() => {
      window.electronAPI.notifyModalClosed();
    }, ANIMATION_DELAYS.MODAL_CLOSE);
  }
}

// Theme preview on hover
let isPreviewingTheme = false;
let savedThemeBeforePreview = null;

document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    selectTheme(card.dataset.theme, card);
  });

  // Preview theme on hover
  card.addEventListener('mouseenter', () => {
    const previewTheme = card.dataset.theme;
    if (previewTheme !== currentTheme && !isPreviewingTheme) {
      isPreviewingTheme = true;
      savedThemeBeforePreview = currentTheme;
      // Apply preview without animation
      document.body.className = `theme-${previewTheme}`;
    }
  });

  card.addEventListener('mouseleave', () => {
    if (isPreviewingTheme && savedThemeBeforePreview) {
      // Restore saved theme without animation
      document.body.className = `theme-${savedThemeBeforePreview}`;
      isPreviewingTheme = false;
      savedThemeBeforePreview = null;
    }
  });

  // Add keyboard support
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTheme(card.dataset.theme, card);
    }
  });
});

document.getElementById('mottoInput').addEventListener('input', updateCharCounter);
document.getElementById('editCancelBtn').addEventListener('click', closeEdit);
document.getElementById('editSaveBtn').addEventListener('click', saveMotto);
document.getElementById('editModalCloseBtn').addEventListener('click', closeEdit);
document.getElementById('themeModalCloseBtn').addEventListener('click', closeTheme);

document.getElementById('mottoInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !document.getElementById('editSaveBtn').disabled) {
    saveMotto();
  } else if (e.key === 'Escape') {
    closeEdit();
  }
});

document.getElementById('aboutCloseBtn').addEventListener('click', closeAbout);
document.getElementById('aboutModalCloseBtn').addEventListener('click', closeAbout);

document.getElementById('copyWechatBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const originalText = btn.textContent;
  const wechatId = 'AIPMAndy';
  try {
    await navigator.clipboard.writeText(wechatId);
    btn.textContent = userLang === 'zh' ? '已复制 ✓' : 'Copied ✓';
    btn.style.background = 'rgba(52, 199, 89, 0.2)';
    showToast(userLang === 'zh' ? '已复制微信号' : 'WeChat ID copied', 'success', TOAST_DURATIONS.SUCCESS);
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, TOAST_DURATIONS.SHORT);
  } catch (err) {
    const input = document.createElement('input');
    input.value = wechatId;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    btn.textContent = userLang === 'zh' ? '已复制 ✓' : 'Copied ✓';
    btn.style.background = 'rgba(52, 199, 89, 0.2)';
    showToast(userLang === 'zh' ? '已复制微信号' : 'WeChat ID copied', 'success', TOAST_DURATIONS.SUCCESS);
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, TOAST_DURATIONS.SHORT);
  }
});

document.getElementById('copyEmailBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const originalText = btn.textContent;
  const email = 'supera6@qq.com';
  try {
    await navigator.clipboard.writeText(email);
    btn.textContent = userLang === 'zh' ? '已复制 ✓' : 'Copied ✓';
    btn.style.background = 'rgba(52, 199, 89, 0.2)';
    showToast(userLang === 'zh' ? '已复制邮箱' : 'Email copied', 'success', TOAST_DURATIONS.SUCCESS);
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, TOAST_DURATIONS.SHORT);
  } catch (err) {
    const input = document.createElement('input');
    input.value = email;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    btn.textContent = userLang === 'zh' ? '已复制 ✓' : 'Copied ✓';
    btn.style.background = 'rgba(52, 199, 89, 0.2)';
    showToast(userLang === 'zh' ? '已复制邮箱' : 'Email copied', 'success', TOAST_DURATIONS.SUCCESS);
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, TOAST_DURATIONS.SHORT);
  }
});

// Inspiration button and modal
document.getElementById('inspirationBtn').addEventListener('click', showInspiration);
document.getElementById('inspirationModalCloseBtn').addEventListener('click', closeInspiration);

if (window.electronAPI) {
  if (window.electronAPI.onShowAbout) {
    window.electronAPI.onShowAbout(() => showAbout());
  }
  if (window.electronAPI.onShowEdit) {
    window.electronAPI.onShowEdit(() => showEdit());
  }
  if (window.electronAPI.onShowTheme) {
    window.electronAPI.onShowTheme(() => showTheme());
  }
  if (window.electronAPI.onChangeLanguage) {
    window.electronAPI.onChangeLanguage((lang) => {
      setLanguage(lang);
    });
  }
}

document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target.id === 'editModal') closeEdit();
});

document.getElementById('themeModal').addEventListener('click', (e) => {
  if (e.target.id === 'themeModal') closeTheme();
});

document.getElementById('aboutModal').addEventListener('click', (e) => {
  if (e.target.id === 'aboutModal') closeAbout();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEdit();
    closeTheme();
    closeAbout();
  }

  // Global shortcuts
  if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
    e.preventDefault();
    showEdit();
  }

  if ((e.metaKey || e.ctrlKey) && e.key === 't') {
    e.preventDefault();
    showTheme();
  }
});
