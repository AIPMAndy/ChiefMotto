# ChiefMotto 国际化测试清单

## 测试步骤
1. 启动应用：`npm start`
2. 右键点击 → Language → English
3. 等待页面重新加载（应该自动刷新）
4. 逐一检查以下所有界面

---

## ✅ 主窗口
- [ ] 底部提示文字："Right-click to edit (Cmd+E) or switch theme (Cmd+T)"
- [ ] 关闭按钮 tooltip："Quit (Cmd+Q)"

---

## ✅ 右键菜单
- [ ] Edit Motto (Cmd+E)
- [ ] Switch Theme (Cmd+T)
- [ ] Language > English (选中)
- [ ] Language > 中文 (Chinese)
- [ ] Window Level > Minimized (Translucent)
- [ ] Window Level > Normal (Interactive)
- [ ] Window Level > Floating (Always on Top)
- [ ] Hide Window
- [ ] Reset Position
- [ ] About ChiefMotto
- [ ] Quit

---

## ✅ 托盘菜单
- [ ] ChiefMotto
- [ ] Show/Hide
- [ ] Edit Motto (Cmd+E)
- [ ] Switch Theme (Cmd+T)
- [ ] Language > English (选中)
- [ ] Language > 中文 (Chinese)
- [ ] Window Level > Transparent (Click-through)
- [ ] Window Level > Normal (Interactive)
- [ ] Window Level > Floating (Always on Top)
- [ ] About ChiefMotto
- [ ] Quit ChiefMotto

---

## ✅ 编辑弹窗 (Cmd+E)
- [ ] 标题："Edit Motto"
- [ ] 提示："100 characters max"
- [ ] 输入框 placeholder："Enter your motto"
- [ ] 字符计数："0 / 100"
- [ ] 键盘提示："↵ Save    Esc Cancel"
- [ ] 保存按钮："Save"
- [ ] 取消按钮："Cancel"

---

## ✅ 主题弹窗 (Cmd+T)
- [ ] 标题："Choose Theme"
- [ ] 提示："Select your visual style"
- [ ] 主题名称：
  - [ ] Glass
  - [ ] Vintage
  - [ ] Gift Card
  - [ ] Minimal
  - [ ] Rainbow
  - [ ] Neon
  - [ ] Wood
  - [ ] Sakura
- [ ] 主题描述：
  - [ ] Modern & Clean
  - [ ] Nostalgic
  - [ ] Warm
  - [ ] Simple
  - [ ] Colorful
  - [ ] Futuristic
  - [ ] Natural
  - [ ] Romantic
- [ ] 底部提示："Press Esc to close"

---

## ✅ About 弹窗
- [ ] 标题："ChiefMotto"
- [ ] 版本："Version 1.0.0"
- [ ] 当前座右铭：（显示用户输入的内容，不翻译）
- [ ] 描述："A minimal desktop motto app"
- [ ] 联系标题："💡 Like this app?"
- [ ] 联系说明："Get in touch for updates and more tools"
- [ ] 微信区域：**应该隐藏**（英文模式下不显示）
- [ ] 邮箱显示："supera6@qq.com"
- [ ] 复制邮箱按钮："Copy Email"
- [ ] 底部提示："Press Esc to close"
- [ ] 关闭按钮："Close"

---

## ✅ Toast 提示
测试以下操作并检查提示：
- [ ] 保存成功："Saved"
- [ ] 空白座右铭："Motto cannot be empty"
- [ ] 超过字数："100 characters max"
- [ ] 加载失败："Failed to load, please restart"
- [ ] 保存失败："Failed to save, please retry"

---

## ✅ 切换到中文测试
1. 右键 → Language → 中文
2. 所有上述内容应该显示为中文
3. About 弹窗应该显示微信联系方式

---

## 已知问题
- 无

## 优化建议
- 语言切换应该更流畅
- 可以添加更多语言支持
