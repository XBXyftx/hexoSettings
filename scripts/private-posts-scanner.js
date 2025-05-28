const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 缓存上次扫描的文件哈希
let lastScanHash = '';

// 使用 filter 而不是 generator，避免重复执行
hexo.extend.filter.register('before_generate', function() {
  const privatePostsDir = path.join(hexo.source_dir, 'coffer', 'private-posts');
  const outputPath = path.join(hexo.source_dir, 'coffer', 'private-posts.json');
  
  // 检查目录是否存在
  if (!fs.existsSync(privatePostsDir)) {
    if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== '[]') {
      console.log('私密文章目录不存在，创建目录:', privatePostsDir);
      fs.mkdirSync(privatePostsDir, { recursive: true });
      fs.writeFileSync(outputPath, '[]', 'utf8');
    }
    return;
  }
  
  // 计算目录内容的哈希值，用于检测变化
  const files = fs.readdirSync(privatePostsDir).filter(file => file.endsWith('.md')).sort();
  const currentHash = crypto.createHash('md5');
  
  files.forEach(filename => {
    const filePath = path.join(privatePostsDir, filename);
    const stats = fs.statSync(filePath);
    currentHash.update(`${filename}:${stats.mtime.getTime()}`);
  });
  
  const currentHashValue = currentHash.digest('hex');
  
  // 如果内容没有变化，跳过扫描
  if (currentHashValue === lastScanHash && fs.existsSync(outputPath)) {
    return;
  }
  
  lastScanHash = currentHashValue;
  console.log('🔍 检测到私密文章变化，开始扫描目录:', privatePostsDir);
  
  try {
    // 使用之前已经获取的文件列表
    
    console.log('📁 找到的Markdown文件:', files);
    
    const privatePosts = [];
    
    files.forEach(filename => {
      const filePath = path.join(privatePostsDir, filename);
      console.log('📖 正在处理文件:', filePath);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log('📄 文件内容前100字符:', content.substring(0, 100));
        
        // 解析Front Matter - 修复正则表达式
        const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (frontMatterMatch) {
          console.log('✅ 找到Front Matter:', frontMatterMatch[1].substring(0, 100));
          
          const frontMatter = frontMatterMatch[1];
          const postContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
          
          // 解析标题、日期等信息 - 改进正则表达式
          const titleMatch = frontMatter.match(/title:\s*(.+?)(?:\r?\n|$)/);
          const dateMatch = frontMatter.match(/date:\s*(.+?)(?:\r?\n|$)/);
          const tagsMatch = frontMatter.match(/tags:\s*\[(.*?)\]/s);
          const categoriesMatch = frontMatter.match(/categories:\s*\[(.*?)\]/s);
          const descriptionMatch = frontMatter.match(/description:\s*(.+?)(?:\r?\n|$)/);
          
          console.log('🏷️ 解析结果:', {
            title: titleMatch ? titleMatch[1] : 'null',
            date: dateMatch ? dateMatch[1] : 'null',
            tags: tagsMatch ? tagsMatch[1] : 'null',
            categories: categoriesMatch ? categoriesMatch[1] : 'null'
          });
          
          // 提取文章摘要（前200个字符）
          const excerpt = postContent
            .replace(/[#*`\[\]]/g, '') // 移除markdown标记
            .replace(/\r?\n+/g, ' ') // 替换换行为空格
            .trim()
            .substring(0, 200) + (postContent.length > 200 ? '...' : '');
          
          const postInfo = {
            filename: filename,
            title: titleMatch ? titleMatch[1].trim().replace(/['"]/g, '') : filename.replace('.md', ''),
            date: dateMatch ? dateMatch[1].trim() : '',
            tags: tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, '')) : [],
            categories: categoriesMatch ? categoriesMatch[1].split(',').map(cat => cat.trim().replace(/['"]/g, '')) : [],
            description: descriptionMatch ? descriptionMatch[1].trim().replace(/['"]/g, '') : '',
            excerpt: excerpt,
            wordCount: postContent.length,
            lastModified: fs.statSync(filePath).mtime.toISOString()
          };
          
          console.log('✅ 成功解析文章:', postInfo.title);
          privatePosts.push(postInfo);
        } else {
          console.warn('⚠️ 文件没有有效的Front Matter:', filename);
          console.log('📝 文件开头内容:', content.substring(0, 200));
        }
      } catch (error) {
        console.error('❌ 处理文件时出错:', filename, error.message);
      }
    });
    
    // 写入JSON文件
    fs.writeFileSync(outputPath, JSON.stringify(privatePosts, null, 2), 'utf8');
    console.log(`✅ 私密文章扫描完成: 找到 ${privatePosts.length} 篇文章`);
    console.log('📄 生成的JSON文件:', outputPath);
    
  } catch (error) {
    console.error('❌ 私密文章扫描失败:', error);
    // 创建空的JSON文件
    fs.writeFileSync(outputPath, '[]', 'utf8');
  }
}); 