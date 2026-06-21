// Initialize i18n content after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  // Update hint text
  document.getElementById('hintText').textContent = t('hintText');

  // Update close button tooltip
  document.getElementById('closeBtn').title = userLang === 'zh' ? '退出 (Cmd+Q)' : 'Quit (Cmd+Q)';

  // Update edit modal
  document.getElementById('editTitle').textContent = t('editTitle');
  document.getElementById('editHint').textContent = t('editHint');
  document.getElementById('mottoInput').placeholder = t('editPlaceholder');
  document.getElementById('editSaveText').textContent = t('editSave');
  document.getElementById('editCancelBtn').textContent = t('editCancel');
  document.getElementById('inspirationBtn').textContent = t('needInspiration');
  document.getElementById('inspirationTitle').textContent = t('inspirationTitle');

  // Update char counter initial state
  document.getElementById('charCounter').textContent = t('charCounter').replace('{current}', '0');

  // Update theme modal
  document.getElementById('themeTitle').textContent = t('themeTitle');
  document.getElementById('themeHint').textContent = t('themeHint');
  document.getElementById('themeModalHint').innerHTML = `${t('closeHint').replace('Esc', `<span class="key">${t('keyEsc')}</span>`)}`;

  // Update theme cards using data attributes
  document.querySelectorAll('.theme-name').forEach(el => {
    const theme = el.getAttribute('data-i18n');
    if (theme) {
      el.textContent = t(`themeNames.${theme}`);
    }
  });

  document.querySelectorAll('.theme-preview').forEach(el => {
    const theme = el.getAttribute('data-i18n-preview');
    if (theme) {
      el.textContent = t(`themePreviews.${theme}`);
    }
  });

  // Update about modal
  document.getElementById('aboutTitle').textContent = t('aboutTitle');
  document.getElementById('aboutVersion').textContent = t('aboutVersion');
  document.getElementById('aboutSlogan').textContent = t('aboutSlogan');
  document.getElementById('currentMottoLabel').textContent = t('currentMottoLabel');
  document.getElementById('aboutDescription').textContent = t('aboutDesc');

  // Update usage stats
  updateUsageStats();

  document.getElementById('aboutCloseBtn').textContent = t('closeButton');
  document.getElementById('aboutHint').innerHTML = `${t('closeHint').replace('Esc', `<span class="key">${t('keyEsc')}</span>`)}`;

  // Update contact section
  document.getElementById('contactTitle').textContent = t('contactTitle');
  document.getElementById('contactDesc').textContent = t('contactDesc');
  document.getElementById('copyWechatBtn').textContent = t('copyWechat');
  document.getElementById('copyEmailBtn').textContent = t('copyEmail');
  document.getElementById('wechatHint').textContent = t('wechatHint');

  // Hide WeChat section for non-Chinese users
  if (userLang !== 'zh') {
    document.getElementById('wechatContact').style.display = 'none';
  }
});
