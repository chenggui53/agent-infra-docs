const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// 创建输出目录
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// 创建压缩包
const output = fs.createWriteStream(path.join(distPath, 'video-refresh-plugin.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log(`${archive.pointer()} total bytes`);
  console.log('压缩包创建成功');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// 添加要压缩的文件
const filesToInclude = [
  'manifest.json',
  'popup.html',
  'popup.js', 
  'content.js',
  'background.js',
  'README.md'
];

filesToInclude.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    archive.file(fullPath, { name: file });
  }
});

// 添加图标目录
if (fs.existsSync(path.join(__dirname, 'icons'))) {
  archive.directory('icons', 'icons');
}

// 完成压缩
archive.finalize();
