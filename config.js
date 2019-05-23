const path = require('path');

const config = {
  functionPath: path.join(__dirname, 'src/function'),
  env: path.join(__dirname, './.env'),
  template: path.join(__dirname, './template.yml'),
  serviceName: 'todo',
};

module.exports = config;
