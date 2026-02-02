# 实现车型简拼(cxjp)字段功能

## 前端修改 (addInfor.vue)
1. **添加 cxjp 字段到 formValue**：在 formValue 对象中添加 cxjp 字段
2. **添加 cx 字段监听**：使用 watch 监听 formValue.cx 的变化
3. **实现车型简拼生成逻辑**：
   - 遍历选中的车型数组
   - 对每个车型名称生成简拼（使用现有的 generatePinyinFirstLetter 函数）
   - 将所有车型简拼合并为一个字符串
4. **更新表单清空逻辑**：在 handleClearForm 函数中添加 cxjp 字段的清空

## 后端修改 (partsService.js)
1. **修改 createPartInfo 函数**：
   - 添加 cxjp 参数接收
   - 在 SQL INSERT 语句中添加 cxjp 字段
   - 在 VALUES 数组中添加 cxjp 值
2. **修改 updatePartInfo 函数**：
   - 添加 cxjp 参数接收
   - 在 SQL UPDATE 语句中添加 cxjp 字段
   - 在参数数组中添加 cxjp 值

## 数据库修改
1. **添加 cxjp 字段到 part_info 表**：
   - 使用 ALTER TABLE 语句添加 cxjp 字段
   - 字段类型为 VARCHAR，用于存储车型简拼字符串

## 实现步骤
1. 首先修改前端代码，添加 cxjp 字段和监听逻辑
2. 然后修改后端服务，添加 cxjp 字段的处理
3. 最后执行数据库迁移，添加 cxjp 字段到表结构

## 预期效果
- 当用户选择车型时，系统自动生成车型简拼
- 车型简拼与其他表单数据一起提交到后端
- 后端将车型简拼保存到数据库
- 数据库表结构中新增 cxjp 字段