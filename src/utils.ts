import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';

export interface FCRequest {
  headers: IncomingHttpHeaders;
  path: string;
  queries: { [key: string]: string };
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
  url: string;
}

export interface FCResult {
  statusCode?: number;
  headers?: object;
  body?: string | Readable | Buffer;
}

export interface FCResponse {
  setStatusCode(status: number): void;
  send(body: string | Readable | Buffer);
  setHeader(key: string, value: string);
}

export interface FCContext {
  requestId: string;
  credentials: {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
  };
}

/**
 * 函数错误
 * 第一个参数为字符串或 error
 * 第二个参数为 http status 默认为 500
 */
class FCError {
  public code: number;
  public error: Error;

  constructor(error: string | Error, code?: number) {
    this.code = code || 500;
    if (error instanceof Error) {
      this.error = error;
    } else {
      this.error = new Error(error);
    }
  }
}

export type aliCloudFCHandler = (
  request: FCRequest,
  response: FCResponse,
  context: FCContext
) => void;

export type aliCloudFC = (request: FCRequest, context: FCContext) => FCResult;

export type aliCloudAsyncFC = (request: FCRequest, context: FCContext) => Promise<FCResult>;

function errorConvert(input: Error | FCError): FCResult {
  let error: FCError;

  if (input instanceof Error) {
    error = new FCError(input);
  } else {
    error = input;
  }

  return {
    statusCode: error.code,
    body: JSON.stringify({
      message: error.error.message,
    }),
  };
}

function hook(func: aliCloudFC) {
  return (request: FCRequest, response: FCResponse, context: FCContext) => {
    let result: FCResult;
    try {
      result = func(request, context);
    } catch (error) {
      result = errorConvert(error as Error | FCError);
    }
    if (result.statusCode) {
      response.setStatusCode(result.statusCode);
    }
    response.setStatusCode(200);
    response.send(result.body);
  };
}
function asyncHook(func: aliCloudAsyncFC) {
  return (request: FCRequest, response: FCResponse, context: FCContext) => {
    func(request, context)
      .then((result: FCResult) => {
        if (result.statusCode) {
          response.setStatusCode(result.statusCode);
        }
        response.setStatusCode(200);
        response.setHeader('content-type', 'application/json');
        response.send(result.body);
      })
      .catch((error: FCError | Error) => {
        const result = errorConvert(error);
        response.setStatusCode(result.statusCode);
        response.send(result.body);
      });
  };
}

function jsonResult(result: Object): FCResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
}

export { hook, asyncHook, FCError, jsonResult, errorConvert };
