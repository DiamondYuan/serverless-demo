import { asyncHook, FCContext, FCRequest, jsonResult, FCError } from '../utils';
let TableStore = require('tablestore');
let instanceName = 'shiheng-todo';
let tableName = 'demo';
let Long = TableStore.Long;

export const codeGenerate = async (_request: FCRequest, _context: FCContext) => {
  let creds = _context.credentials;
  let client = new TableStore.Client({
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.accessKeySecret,
    stsToken: creds.securityToken,
    endpoint: `http://${instanceName}.cn-hangzhou.ots.aliyuncs.com`,
    instancename: instanceName,
  });

  const { id } = _request.queries;
  if (!id) {
    throw new FCError('please input id', 400);
  }

  let params = {
    tableName: tableName,
    condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
    primaryKey: [{ id: Long.fromNumber(id) }],
  };
  await client.deleteRow(params);
  return jsonResult({ result: 'success' });
};

export const handler = asyncHook(codeGenerate);

export const config = {
  methods: ['DELETE'],
  env: {},
};
