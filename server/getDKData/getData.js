const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
// const fs = require('fs');
const fs = require('fs').promises; // 异步文件系统模块
const path = require('path');


// 定义Cookie存储路径
const COOKIE_STORAGE_PATH = path.join(__dirname, 'cookies.json');

// 保存Cookie到本地
async function saveCookiesToFile(cookies) {
  try {
    // 将Cookie对象转换为字符串并保存
    const cookiesJSON = JSON.stringify(cookies);
    await fs.writeFile(COOKIE_STORAGE_PATH, cookiesJSON);
    console.log('Cookie已保存到本地');
  } catch (error) {
    console.error('保存Cookie失败:', error);
    throw error;
  }
}

// 从本地读取Cookie
async function loadCookiesFromFile() {
  try {
    // 检查文件是否存在
    await fs.access(COOKIE_STORAGE_PATH);
    
    // 读取并解析Cookie
    const cookiesJSON = await fs.readFile(COOKIE_STORAGE_PATH, 'utf8');
    const cookies = JSON.stringify(cookiesJSON);
    console.log('从本地加载Cookie成功',cookiesJSON);

    return cookies;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，创建空Cookie文件
      console.log('Cookie文件不存在，创建新文件...');
      // const emptyCookies = 'idcok=139.186.146.87; ztcok=CQ-BYDJICAI; namecok=%E7%AE%A1%E7%90%86%E5%91%98; passwordcok=123456; JSESSIONID=3D8674B350FF8253494C4607D7138D99; id=139.186.146.87; zt=CQ-BYDJICAI; name=%E7%AE%A1%E7%90%86%E5%91%98; password=123456' // 手动设置 Cookie
      const emptyCookies = await simulateLogin()
      await fs.writeFile(COOKIE_STORAGE_PATH, JSON.stringify(emptyCookies));
      console.log('已创建空Cookie文件');
      return emptyCookies;
    } else {
      // 其他错误（如权限问题、JSON解析错误）
      console.error('读取Cookie文件失败:', error);
      throw error; // 向上抛出错误，由调用者处理
    }
    
  }
}

function parseTableFromUrl(html) {
  try {
    // 获取HTML内容
    // const html = await request(url);
    
    // 解析表格
    const $ = cheerio.load(html);
    const table = $('#foeach');
    const result = { headers: [], rows: [] };
    
    // 提取表头
    const headers = table.find('tr:first th');
    headers.each((index, element) => {
      result.headers.push($(element).text().trim());
    });
    
    // 提取数据行
    const dataRows = table.find('tr.tss');
    dataRows.each((rowIndex, rowElement) => {
      const rowData = {};
      const cells = $(rowElement).find('td');
      
      cells.each((cellIndex, cellElement) => {
        const cellHtml = $(cellElement).html() || '';
        const cellText = extractCellText(cellHtml);
        //const cellText = $(cellElement).text().trim();
        if (cellText && result.headers[cellIndex]) {
          rowData[result.headers[cellIndex]] = cellText;
        }
      });
      
      if (Object.keys(rowData).length > 0) {
        result.rows.push(rowData);
      }
    });
    
    return result;
  } catch (error) {
    console.error('解析表格失败:', error);
    throw error;
  }
}

// 提取单元格文本（支持多种情况）
function extractCellText(cellHtml) {
  const $ = cheerio.load('<td>' + cellHtml + '</td>');
  
  // 尝试从特定类名的span提取（商品编码、名称）
  const span = $('span.am-dropdown-toggle');
  if (span.length > 0) {
    return span.text().trim();
  }
  
  // 尝试从a标签提取（库存列）
  const aText = $('a').text().trim();
  if (aText) {
    return aText;
  }
  
  // 尝试从td直接提取（其他列）
  return $.text().trim();
}


// // GET 请求
// axios.get('https://api.example.com/data')
//   .then((response) => {
//     console.log('响应数据:', response.data); // 直接获取解析后的数据
//   })
//   .catch((error) => {
//     console.error('请求失败:', error);
//   });

// 延迟函数（Promise 封装）
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// 组装Cookie
function convertCookieObjectToString(cookieObject) {
 
  if (!cookieObject || typeof cookieObject !== 'object') {
    return '';
  }

  let keys = Object.keys(cookieObject);
  
  const cookiePairs = keys.map(key => `${key}=${cookieObject[key]}`);
  return cookiePairs.join('; ');
}
// 提取所有Cookie
function extractAllCookies(cookieHeaders) {
  const cookies = {};
  if (!Array.isArray(cookieHeaders)) return cookies;
  
  cookieHeaders.forEach(cookie => {
    const parts = cookie.split(';')[0].split('=');
    if (parts.length === 2) {
      const name = parts[0].trim();
      const value = parts[1].trim();
      cookies[name] = value;
    }
  });
  return cookies;
}

// 登录函数,获取刷新jsoo
async function simulateLogin() {
  
  try {
    // 验证输入
    id='139.186.146.87'
    zt= 'CQ-BYDJICAI'
    name='管理员'
    password='123456'

    console.log('开始登录请求...');
    
    // 发送POST请求
    // 发送POST请求
    const response = await axios.post(
      'http://139.186.146.87:8080/getlogin.action',
      qs.stringify({ id, zt, name, password }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true // 允许携带Cookie
      }
    );
    
    if (response.data === 1) {
      const setCookieHeaders = response.headers['set-cookie'];
      let newCookieData = extractAllCookies(setCookieHeaders)
      newCookieData = convertCookieObjectToString(newCookieData)
      saveCookiesToFile(newCookieData)
      return newCookieData;
    } else if (response.data === 3) {
      console.error('服务器连接失败,检查id是否正确');
      return null;
    } else {
      console.error('登录失败:', response.data);
      return null;
    }
  } catch (error) {
    console.error('登录请求失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    throw error;
  }

}

// POST 请求（带 JSON 数据）
async function getDKdata(name, bianma, models, brand ) {
  try {
    
    if (!name) {
      name='' 
    }else if(!bianma){
      bianma = ''
    }else if(!models){
      models = ''
    }else if(!brand){
      brand = ''
    }
    // 如果所有条件都为空，返回null
    
    if( !name&&!bianma&&!models&&!brand ){
      return null;
    }
    
    CookieData = await loadCookiesFromFile()
    
    const response = await axios.post(
      'http://139.186.146.87:8080/sales_quotation_Cable.action?way=1',
      qs.stringify({ name, bianma, models, brand }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': CookieData
        }
      }
    );

    console.log('API响应状态:', response.status);
    
    
    if (response.data.includes(`parent.window.location.href='getlogin.action?deng=1&method=get&way=1'`)) {
      console.log('检测到登录过期，重新获取Cookie...');
      
      // 等待simulateLogin完成并获取新Cookie
      const newCookieData = await simulateLogin();
      await delay(2000);
      
      if (newCookieData) {
        
        // 递归调用getDKdata并等待结果
        const result = await getDKdata(name, bianma, models, brand);
        return result; // 返回递归调用的结果
      } else {
        console.log('未获取到有效JSESSIONID，不进行递归');
        return null; // 没有有效Cookie，返回null
      }
    }
    
    // 解析表格数据
    const tableData = parseTableFromUrl(response.data);
    // console.log('成功获取数据:', tableData);
    if(!tableData.headers){
      console.log('响应数据:', response.data);
    }
    return tableData;
    
  } catch (error) {
    console.error('获取数据失败:', error.message);
    throw error; // 抛出错误，由调用者处理
  }
}

async function main() {
  try {
    const data = await getDKdata('qc', '', '19q', '');
    // console.log('最终结果:', data);
  } catch (error) {
    console.error('主流程错误:', error);
  }
}

// 直接运行创建表的脚本
if (require.main === module) {
  // main()
}
module.exports = {
  getDKdata
};
