import request from 'supertest';

export function expectJsonError(
  response: request.Response,
  status: number,
): void {
  expect(response.status).toBe(status);
  expect(response.headers['content-type']).toMatch(/^application\/json/);
  const body = response.body as Record<string, unknown>;
  expect(typeof body.message).toBe('string');
  expect(body.message).not.toBe('');
  expect(JSON.stringify(body)).not.toMatch(/\bat \S+:\d+/);
}
