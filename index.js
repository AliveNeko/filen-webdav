#!/usr/bin/env node
import { FilenSDK } from "@filen/sdk";
import path from "path";
import os from "os";
import { WebDAVServer } from "@filen/webdav";
import 'dotenv/config';

// 获取环境变量
const options = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  webdavUsername: process.env.WEBDAV_USERNAME,
  webdavPassword: process.env.WEBDAV_PASSWORD,
  hostname: process.env.HOSTNAME || '127.0.0.1',
  port: process.env.PORT || '8019',
};

if (!options.email || !options.password) {
  console.error("请提供邮箱和密码！");
  process.exit(1);
}

log("邮箱和密码已获取，准备连接...");

// Standalone mode, single user
// Initialize a SDK instance (optional)
const filen = new FilenSDK({
  metadataCache: true,
  connectToSocket: true,
  tmpPath: path.join(os.tmpdir(), "filen-sdk")
});

await filen.login({
  email: options.email,
  password: options.password,
});

const hostname = options.hostname;
const port = parseInt(options.port, 10); // 确保端口号为整数
const https = false;
const server = new WebDAVServer({
  hostname,
  port,
  https,
  user: {
    username: options.webdavUsername,
    password: options.webdavPassword,
    sdk: filen,
  },
  authMode: "basic",
});

await server.start();

log(
  `WebDAV server started on ${https ? "https" : "http"}://${hostname}:${port}`
);

// 时间戳日志函数
function log(...args) {
  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
  console.log(`[${timestamp}]`, ...args);
}