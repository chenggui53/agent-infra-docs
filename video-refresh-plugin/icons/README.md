# 插件图标

这个目录包含插件需要的图标文件。

## 图标尺寸要求

Chrome 插件图标需要以下尺寸：
- 16x16px - 浏览器工具栏图标
- 48x48px - 扩展程序管理页面
- 128x128px - Chrome Web Store 显示

## 如何创建图标

1. 准备一个高分辨率的 SVG 或 PNG 文件（至少 512x512px）
2. 使用图标编辑工具（如 Photoshop, GIMP, 或在线工具）创建以下尺寸：
   - 16x16px (icon16.png)
   - 48x48px (icon48.png) 
   - 128x128px (icon128.png)
3. 保存为 PNG 格式，保存到这个目录

## 临时图标

如果您没有专业的图标制作工具，可以使用简单的文本图标或形状图标。

### 简单的临时图标制作

**方法 1：使用在线工具**
- 使用 Canva (https://www.canva.com/) 创建简单图标
- 使用 Figma (https://www.figma.com/) 在线设计
- 使用 LogoMakr (https://logomakr.com/) 免费图标生成

**方法 2：使用 CSS 创建简单图标**
对于临时使用，可以创建一个简单的 HTML 页面来生成图标：

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .icon {
            width: 128px;
            height: 128px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="icon">▶</div>
</body>
</html>
```

## 建议的图标内容

对于视频刷新插件，建议包含以下元素：
- 视频播放图标 ▶
- 刷新/循环图标 🔄
- 或者简单的学习相关图标 📚

## 注意事项

- 图标需要视觉清晰，对比度高
- 避免使用复杂的细节
- 确保在不同尺寸下都能清晰识别

## 参考资源

- Chrome 扩展图标规范：https://developer.chrome.com/docs/extensions/mv3/manifest/icons/
- 免费图标资源：https://icons8.com/
- 图标设计工具：https://www.freelogodesign.org/
