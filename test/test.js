/**
 * 访问 ip138.com 并将返回内容保存到本地 HTML 文件（内置 fetch + 异步 fs）
 */
const fs = require('fs').promises; // 引入异步文件系统模块
const path = require('path'); // 引入路径模块，处理文件路径（避免跨平台问题）

async function getIp138ContentAndSave() {
  try {
    // 1. 发送 GET 请求，模拟浏览器请求头
    const response = await fetch('https://my.ip.cn/json/?ticket=094d6f68ae71941934a99d82e629925c1768202852', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://my.ip.cn/'
      }
    });

    // 2. 验证请求是否成功
    if (!response.ok) {
      throw new Error(`请求失败，状态码：${response.status}`);
    }

    // 3. 解析返回的 HTML 内容
    const htmlContent = await response.text();

    // 4. 定义本地文件保存路径和文件名
    const savePath = path.join(__dirname, 'ip138_result.html'); // __dirname 为当前脚本所在目录，生成绝对路径
    // 可选：保存到自定义目录（如 ./downloads/ip138.html），需确保目录存在
    // const savePath = path.join(__dirname, 'downloads', 'ip138.html');

    // 5. 异步写入文件（utf-8 编码，确保中文不乱码）
    await fs.writeFile(savePath, htmlContent, 'utf-8');

    // 6. 输出执行结果
    console.log(`请求成功！内容已保存到本地文件：`);
    console.log(savePath);
    console.log('===== 部分返回内容预览 =====');
    console.log(htmlContent.substring(0, 500) + '...'); // 预览前 500 个字符

    return {
      content: htmlContent,
      savePath: savePath
    };
  } catch (error) {
    console.error('执行出错：', error.message);
  }
}

// 调用函数执行请求并保存文件
getIp138ContentAndSave();