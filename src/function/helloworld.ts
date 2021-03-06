import { asyncHook, FCContext, FCRequest, jsonResult } from '../utils';

export const codeGenerate = async (_request: FCRequest, _context: FCContext) => {
  return jsonResult({ result: 'hello wold' });
};

export const handler = asyncHook(codeGenerate);

export const config = {
  methods: ['GET'],
  env: {},
};
