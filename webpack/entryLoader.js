const fs = require('fs');
const path = require('path');

const entryLoader = functionPath => {
  const fileList = fs.readdirSync(functionPath);
  const entry = {};
  fileList.forEach(file => {
    const filePath = path.join(functionPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      return;
    }
    const name = file.substr(0, file.lastIndexOf('.'));
    if (entry[name]) {
      console.log(`函数的文件名冲突 存在两个文件名均为${name}的函数`);
      process.exit(1);
    }
    entry[name] = filePath;
  });
  return entry;
};

module.exports = entryLoader;
