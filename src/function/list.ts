import { asyncHook, FCContext, FCRequest, jsonResult } from '../utils';
let TableStore = require('tablestore');
let instanceName = 'shiheng-todo';
let tableName = 'demo';

export const codeGenerate = async (request: FCRequest, _context: FCContext) => {
  let creds = _context.credentials;
  let client = new TableStore.Client({
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.accessKeySecret,
    stsToken: creds.securityToken,
    endpoint: `http://${instanceName}.cn-hangzhou.ots.aliyuncs.com`,
    instancename: instanceName,
  });
  const { offset = '0', limit = '100' } = request.queries;

  const result = await client.search({
    tableName,
    indexName: 'id',
    searchQuery: {
      offset: parseInt(offset, 0),
      limit: parseInt(limit, 0),
      query: {
        queryType: TableStore.QueryType.MATCH_ALL_QUERY,
      },
      getTotalCount: true,
    },
    columnToGet: {
      returnType: TableStore.ColumnReturnType.RETURN_SPECIFIED,
      returnNames: ['content'],
    },
  });

  const { isAllSucceeded, rows, totalCounts } = result;
  return jsonResult({ result: { isAllSucceeded, rows, totalCounts } });
};

export const handler = asyncHook(codeGenerate);

export const config = {
  methods: ['GET'],
  env: {},
};
