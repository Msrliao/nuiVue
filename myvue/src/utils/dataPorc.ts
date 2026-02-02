import { pinyin } from 'pinyin-pro';

function generatePinyinFirstLetter(text: string): string {
  if (!text) return '';  
  return pinyin(text, { pattern: 'first', toneType: 'none', }).replace(/\s/g, '').toUpperCase();
}

export { generatePinyinFirstLetter }