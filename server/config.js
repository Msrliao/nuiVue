// 数据库连接配置
module.exports = {
  database: {
    user: 'neondb_owner',
    password: 'npg_fL5IWgQX6oBR',
    host: 'ep-sweet-hat-a16skty0.ap-southeast-1.aws.neon.tech',
    port: 5432,
    database: 'neondb',
    ssl: true // 启用 SSL 加密，对应 sslmode=require
  },
  server: {
    port: process.env.PORT || 3000
  }
};