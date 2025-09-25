// 从免费数据源获取股票行业信息等数据补充功能
const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * 从新浪财经获取股票的行业信息
 * @param {string} code - 股票代码
 * @returns {Promise<string>} 行业信息
 */
async function getIndustryFromSina(code) {
  try {
    // 确保代码格式正确，深市股票需要补全前导零
    if (code.length < 6) {
      code = code.padStart(6, '0');
      console.log(`补全股票代码为：${code}`);
    }
    
    // 判断股票类型并构建正确的URL
    let market;
    if (code.startsWith('6')) {
      // 沪市股票
      market = 'sh';
    } else if (code.startsWith('0') || code.startsWith('3')) {
      // 深市股票（主板或创业板）
      market = 'sz';
    } else {
      // 其他类型股票，返回未知
      console.log(`未知股票类型，代码：${code}`);
      return '未知';
    }
    
    // 新浪财经的URL
    const urls = [
      `https://finance.sina.com.cn/realstock/company/${market}${code}/gsjs.html`, // 公司简介
      `https://finance.sina.com.cn/realstock/company/${market}${code}/cjbg.html`  // 财务报告
    ];
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };
    
    for (const url of urls) {
      try {
        console.log(`尝试从${url}获取行业信息`);
        const response = await fetch(url, { headers, timeout: 10000 });
        
        if (response.status !== 200) {
          console.log(`请求失败，状态码：${response.status}`);
          continue;
        }
        
        const html = await response.text();
        
        if (html.includes('页面没有找到')) {
          console.log(`页面不存在：${url}`);
          continue;
        }
        
        const $ = cheerio.load(html);
        
        // 尝试通过关键词查找行业信息
        let industry = extractIndustryByKeyword($);
        if (industry !== '未知') {
          return industry;
        }
        
        // 尝试通过特定的CSS选择器
        industry = extractIndustryBySelector($);
        if (industry !== '未知') {
          return industry;
        }
        
      } catch (e) {
        console.log(`从${url}获取信息失败：${e.message}`);
        continue;
      }
    }
    
    // 所有URL都尝试失败
    return '未知';
    
  } catch (e) {
    console.log(`获取股票${code}行业信息失败：${e.message}`);
    return '未知';
  }
}

/**
 * 通过关键词查找行业信息
 * @param {CheerioStatic} $ - Cheerio实例
 * @returns {string} 行业信息
 */
function extractIndustryByKeyword($) {
  try {
    // 查找包含"行业"的标签
    const industryElements = $(`td:contains('行业')`, `span:contains('行业')`, `div:contains('行业')`);
    
    if (industryElements.length > 0) {
      for (const element of industryElements) {
        const text = $(element).text().trim();
        const match = text.match(/行业[:：]\s*([^\s,，]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return '未知';
  } catch (e) {
    console.log(`通过关键词提取行业信息失败：${e.message}`);
    return '未知';
  }
}

/**
 * 通过CSS选择器提取行业信息
 * @param {CheerioStatic} $ - Cheerio实例
 * @returns {string} 行业信息
 */
function extractIndustryBySelector($) {
  try {
    // 尝试不同的选择器模式
    const selectors = [
      '.table_wrapper > table > tbody > tr:contains(行业) > td:last-child',
      '.table_bg001 > tbody > tr:contains(行业) > td:last-child',
      '.stock_bets > dl:contains(行业) > dd',
      '.company_summary > tr:contains(行业) > td:last-child'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0 && element.text().trim()) {
        return element.text().trim();
      }
    }
    
    return '未知';
  } catch (e) {
    console.log(`通过选择器提取行业信息失败：${e.message}`);
    return '未知';
  }
}

/**
 * 获取多只股票的行业信息
 * @param {Array<string>} codes - 股票代码数组
 * @returns {Promise<Array<{code: string, industry: string}>>} 行业信息数组
 */
async function getIndustriesForStocks(codes) {
  const results = [];
  
  // 控制并发数，避免请求过于频繁
  const concurrencyLimit = 3;
  let activeRequests = 0;
  let currentIndex = 0;
  
  return new Promise((resolve) => {
    function processNext() {
      if (currentIndex >= codes.length && activeRequests === 0) {
        resolve(results);
        return;
      }
      
      while (currentIndex < codes.length && activeRequests < concurrencyLimit) {
        const code = codes[currentIndex];
        currentIndex++;
        activeRequests++;
        
        getIndustryFromSina(code)
          .then(industry => {
            results.push({ code, industry });
            activeRequests--;
            processNext();
          })
          .catch(error => {
            console.log(`处理股票${code}时出错：${error.message}`);
            results.push({ code, industry: '未知' });
            activeRequests--;
            processNext();
          });
      }
    }
    
    processNext();
  });
}

module.exports = {
  getIndustryFromSina,
  getIndustriesForStocks
};