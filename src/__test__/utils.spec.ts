import { errorConvert, FCError, jsonResult } from '../utils';

describe('测试 FCError', () => {
  test('测试构造函数', () => {
    const errorMessage = 'DiamondYuan is me';
    const error1 = new FCError(errorMessage);
    expect(error1.code).toBe(500);
    expect(error1.error.message).toBe(errorMessage);

    const error2 = new FCError(new Error(errorMessage));
    expect(error2.code).toBe(500);
    expect(error2.error.message).toBe(errorMessage);

    const error3 = new FCError(new Error(errorMessage), 400);
    expect(error3.code).toBe(400);
    expect(error3.error.message).toBe(errorMessage);

    const error4 = new FCError(errorMessage, 400);
    expect(error4.code).toBe(400);
    expect(error4.error.message).toBe(errorMessage);
  });
});

describe('测试 函数', () => {
  test('测试 errorConvert', () => {
    const errorMessage = 'DiamondYuan is me';
    const result = errorConvert(new Error(errorMessage));
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body as string)).toEqual({
      message: errorMessage,
    });

    const result2 = errorConvert(new FCError(errorMessage, 400));
    expect(result2.statusCode).toBe(400);
    expect(JSON.parse(result2.body as string)).toEqual({
      message: errorMessage,
    });
  });

  test('测试 jsonResult', () => {
    const data = {
      name: 'DiamondYuan',
      love: 'lj',
    };
    const result = jsonResult(data);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body as string)).toEqual(data);
  });
});
