const fs = require('fs');
const path = require('path');
const jsYaml = require('js-yaml');

class TemplateCreatorPlugin {
  constructor(options) {
    this.options = options;
  }

  cat(service, funList, codeUri) {
    const resources = {};
    const envMap = service.envMap;
    resources[service.name] = {
      Type: 'Aliyun::Serverless::Service',
      Properties: {
        Description: service.description || ``,
      },
    };
    funList.forEach(func => {
      const emptyEnv = func.config.env;
      Object.keys(emptyEnv).forEach(key => {
        emptyEnv[key] = envMap[key];
      });
      resources[service.name][func.name] = {
        Type: 'Aliyun::Serverless::Function',
        Properties: {
          Handler: `${func.name}.handler`,
          Runtime: 'nodejs8',
          CodeUri: codeUri,
          Timeout: 60,
          EnvironmentVariables: emptyEnv,
        },
        Events: {},
      };
      resources[service.name][func.name].Events[func.name] = {
        Type: 'HTTP',
        Properties: {
          AuthType: 'ANONYMOUS',
          Methods: func.config.methods,
        },
      };
    });

    return {
      ROSTemplateFormatVersion: '2015-09-01',
      Transform: 'Aliyun::Serverless-2018-04-03',
      Resources: resources,
    };
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync('TemplateCreatorPlugin', (compilation, callback) => {
      let envMap = {};
      if (this.options.env) {
        fs.readFileSync(this.options.env, 'utf8')
          .split('\n')
          .map(p => {
            return p.split('=');
          })
          .filter(p => {
            return p.length === 2;
          })
          .forEach(p => {
            envMap[p[0]] = p[1];
          });
      }
      const status = compilation.toJson();
      /** webpack输出的文件夹 */
      const outputPath = status.outputPath;
      const funcList = [];
      Object.keys(status.entrypoints).forEach(entry => {
        const functionL = require(path.join(outputPath, `${entry}.js`));
        funcList.push({
          name: entry,
          config: functionL.config,
        });
      });
      fs.writeFileSync(
        this.options.template,
        jsYaml.dump(this.cat({ name: this.options.serviceName, envMap }, funcList, outputPath))
      );
      callback();
    });
  }
}

module.exports = TemplateCreatorPlugin;
