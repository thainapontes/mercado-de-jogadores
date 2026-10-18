import { readEnv } from './env';

describe('readEnv', () => {
  it('lê a porta e as origens do CORS', () => {
    expect(
      readEnv({
        PORT: '3001',
        CORS_ORIGIN: 'http://localhost:5173, http://localhost:4173',
      }),
    ).toEqual({
      port: 3001,
      corsOrigins: ['http://localhost:5173', 'http://localhost:4173'],
    });
  });

  it('usa a porta 3000 quando PORT não vem', () => {
    expect(readEnv({ CORS_ORIGIN: 'http://localhost:5173' }).port).toBe(3000);
  });

  it.each([{}, { CORS_ORIGIN: '' }, { CORS_ORIGIN: '*' }])(
    'não sobe com CORS_ORIGIN inválido: %j',
    (source) => {
      expect(() => readEnv(source)).toThrow(/CORS_ORIGIN/);
    },
  );
});
