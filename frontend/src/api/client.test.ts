import { describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient, buildUrl } from './client';

function mockFetch(response: Response) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('buildUrl', () => {
  it('monta a URL com /api/v1 e ignora filtros vazios', () => {
    expect(
      buildUrl('/players', {
        search: 'lua',
        position: '',
        club_id: undefined,
        page: 2,
      }),
    ).toBe('http://localhost:3000/api/v1/players?search=lua&page=2');
  });

  it('mantém as vírgulas dos filtros com mais de um valor', () => {
    expect(buildUrl('/clubs/1/transactions', { type: 'COMPRA,VENDA' })).toBe(
      'http://localhost:3000/api/v1/clubs/1/transactions?type=COMPRA%2CVENDA',
    );
  });
});

describe('apiClient', () => {
  it('envia o corpo em JSON e devolve a resposta', async () => {
    const fetchSpy = mockFetch(jsonResponse(201, { id: 1 }));

    await expect(
      apiClient.post('/clubs', { name: 'Águias FC' }),
    ).resolves.toEqual({ id: 1 });
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/clubs',
      expect.objectContaining({
        method: 'POST',
        body: '{"name":"Águias FC"}',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('lança o message devolvido pela API numa recusa', async () => {
    mockFetch(jsonResponse(409, { message: 'Jogador já tem clube.' }));

    await expect(apiClient.post('/players/1/buy', {})).rejects.toEqual(
      new ApiError(409, 'Jogador já tem clube.'),
    );
  });

  it('avisa quando a API não responde', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));

    await expect(apiClient.get('/players')).rejects.toThrow(
      'Não foi possível conectar à API',
    );
  });

  it('aceita o 204 sem corpo da exclusão', async () => {
    mockFetch(new Response(null, { status: 204 }));

    await expect(apiClient.delete('/players/9')).resolves.toBeUndefined();
  });
});
