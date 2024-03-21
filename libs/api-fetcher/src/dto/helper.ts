export function convertObjectToExample<_, B>(
  object: B,
  code?: number,
  type: 'request' | 'response' = 'response',
) {
  if (type === 'response') {
    return {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'number',
              example: code || 200,
            },
            timestamp: {
              type: 'number',
              example: new Date().valueOf(),
            },
            isSuccess: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              example: object,
            },
          },
        },
      },
    };
  }
}
