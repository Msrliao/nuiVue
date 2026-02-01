const axios = require('axios');

// 配置API地址
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * 从用户输入中提取车型和配件名称
 * @param {string} input 用户输入文本
 * @returns {object} 包含车型和配件名称的对象
 */
function extractQueryInfo(input) {
  // 移除常见的查询前缀和后缀
  const cleanedInput = input.replace(/^查询|^查|^搜索|库存$|情况$|信息$/g, '').trim();
  
  let vehicle = '';
  let part = '';
  
  // 1. 优先匹配 "[车型]的[配件]" 格式
  const ofPattern = /(.+?)的(.+)/;
  const ofMatch = cleanedInput.match(ofPattern);
  if (ofMatch) {
    vehicle = ofMatch[1].trim();
    part = ofMatch[2].trim();
    return { vehicle, part };
  }
  
  // 2. 直接返回空格分隔的两部分，不做复杂的拆分
  // 因为我们的后端API支持模糊匹配，所以可以直接传递关键词
  const spacePattern = /\s+/;
  const inputParts = cleanedInput.split(spacePattern);
  
  if (inputParts.length === 0) {
    return { vehicle: '', part: '' };
  }
  
  if (inputParts.length === 1) {
    // 只有一个词，无法拆分，可能是配件名称
    return { vehicle: '', part: inputParts[0] };
  }
  
  // 对于多个词的情况，尝试不同的拆分方式
  // 常见的配件关键词，这些词应该作为配件的开始
  const partKeywords = ['机油滤清器', '空气滤芯', '空调滤芯', '刹车片', '火花塞', '机油', '机滤', '空滤', '空调滤', '刹车盘', '雨刮器', '电池', '轮胎', '减震器', '离合器', '变速箱油', '防冻液'];
  
  // 检查是否包含明确的配件关键词
  let partKeywordIndex = -1;
  let foundPartKeyword = '';
  
  for (const partKeyword of partKeywords) {
    const index = cleanedInput.indexOf(partKeyword);
    if (index !== -1) {
      partKeywordIndex = index;
      foundPartKeyword = partKeyword;
      break;
    }
  }
  
  if (partKeywordIndex !== -1) {
    // 找到配件关键词，拆分车型和配件
    vehicle = cleanedInput.substring(0, partKeywordIndex).trim();
    part = cleanedInput.substring(partKeywordIndex).trim();
  } else {
    // 没有找到明确的配件关键词，使用第一个空格拆分
    vehicle = inputParts[0];
    part = inputParts.slice(1).join(' ');
  }
  
  return { vehicle, part };
}

/**
 * 调用后端API查询库存信息
 * @param {string} vehicle 车型名称
 * @param {string} part 配件名称
 * @returns {Promise<Array>} 库存查询结果
 */
async function queryInventory(vehicle, part) {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory/search`, {
      params: { vehicle, part }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('查询库存失败:', error);
    return [];
  }
}

/**
 * 格式化查询结果
 * @param {Array} inventory 库存查询结果
 * @param {string} originalVehicle 原始车型输入
 * @param {string} originalPart 原始配件输入
 * @returns {string} 格式化后的响应文本
 */
function formatResult(inventory, originalVehicle, originalPart) {
  if (!inventory || inventory.length === 0) {
    return `未找到"${originalVehicle}"的"${originalPart}"相关库存信息。`;
  }
  
  let result = '';
  inventory.forEach((item, index) => {
    // 确保price是数字类型
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const totalValue = (quantity * price).toFixed(2);
    
    result += `${index + 1}. 车型：${item.vehicle_model}\n`;
    result += `   配件：${item.part_name}\n`;
    result += `   配件编号：${item.part_number || '无'}\n`;
    result += `   分类：${item.category || '无'}\n`;
    result += `   库存数量：${quantity}个\n`;
    result += `   单价：${price.toFixed(2)}元\n`;
    result += `   总价值：${totalValue}元\n`;
    result += `   仓库位置：${item.location || '未知'}\n`;
    result += `   更新时间：${new Date(item.updated_at).toLocaleString()}\n\n`;
  });
  
  return result.trim();
}

/**
 * 车型配件查询主函数
 * @param {string} input 用户输入文本
 * @returns {Promise<string>} 查询结果
 */
async function partsQuery(input) {
  // 1. 提取车型和配件信息
  const { vehicle, part } = extractQueryInfo(input);
  
  if (!vehicle || !part) {
    return '请提供完整的车型和配件信息，例如："查询丰田凯美瑞的机油滤清器库存"。';
  }
  
  // 2. 查询库存信息
  const inventory = await queryInventory(vehicle, part);
  
  // 3. 格式化查询结果
  return formatResult(inventory, vehicle, part);
}

/**
 * Skill入口函数
 * @param {object} context 上下文信息
 * @returns {Promise<object>} Skill响应结果
 */
async function handleRequest(context) {
  const { input } = context;
  
  if (!input || typeof input !== 'string') {
    return {
      success: false,
      message: '请提供有效的查询输入。'
    };
  }
  
  try {
    const result = await partsQuery(input);
    return {
      success: true,
      message: '查询成功',
      data: result
    };
  } catch (error) {
    console.error('Skill处理失败:', error);
    return {
      success: false,
      message: '查询失败，请稍后重试。'
    };
  }
}

// 导出Skill处理函数
module.exports = {
  handleRequest,
  extractQueryInfo,
  queryInventory,
  formatResult
};