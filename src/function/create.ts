import { asyncHook, FCContext, FCRequest, jsonResult, FCError } from '../utils';
let TableStore = require('tablestore');
let instanceName = 'shiheng-todo';
let tableName = 'demo';
let Long = TableStore.Long;
let getRawBody = require('raw-body');

export const codeGenerate = async (request: FCRequest, _context: FCContext) => {
  let creds = _context.credentials;
  let client = new TableStore.Client({
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.accessKeySecret,
    stsToken: creds.securityToken,
    endpoint: `http://${instanceName}.cn-hangzhou.ots.aliyuncs.com`,
    instancename: instanceName,
  });
  const { content } = JSON.parse(await getRawBody(request, 'utf-8'));
  if (!content) {
    throw new FCError('wcontent', 400);
  }
  let params = {
    tableName: tableName,
    condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
    primaryKey: [{ id: Long.fromNumber(Date.now()) }],
    attributeColumns: [{ content }, { timestamp: Date.now() }, { complete: false }],
    returnContent: { returnType: TableStore.ReturnType.Primarykey },
  };
  const response = await client.putRow(params);
  return jsonResult({ result: response.row.primaryKey[0] });
};

export const handler = asyncHook(codeGenerate);

export const config = {
  methods: ['POST'],
  env: {},
};
