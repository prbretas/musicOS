// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { detectDeviceKind, deviceLabel, sessionIdFromToken } from '@/lib/devices';

const UA = {
  winChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 Edg/131.0',
};

describe('tipo do dispositivo', () => {
  it('computador x celular', () => {
    expect(detectDeviceKind(UA.winChrome)).toBe('desktop');
    expect(detectDeviceKind(UA.macSafari, 0)).toBe('desktop');
    expect(detectDeviceKind(UA.iphone)).toBe('mobile');
    expect(detectDeviceKind(UA.android)).toBe('mobile');
  });
  it('iPad que se apresenta como Mac conta como celular/tablet', () => {
    expect(detectDeviceKind(UA.macSafari, 5)).toBe('mobile');
  });
  it('nome legível', () => {
    expect(deviceLabel(UA.winChrome)).toBe('Chrome no Windows');
    expect(deviceLabel(UA.iphone)).toBe('Safari no iPhone');
    expect(deviceLabel(UA.android)).toBe('Chrome no Android');
    expect(deviceLabel(UA.edge)).toBe('Edge no Windows');
    expect(deviceLabel(UA.macSafari, 5)).toBe('Safari no iPad');
  });
});

describe('session_id do token', () => {
  const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  it('lê o claim', () => {
    const token = `${b64url({ alg: 'HS256' })}.${b64url({ sub: 'u1', session_id: 'abc-123' })}.sig`;
    expect(sessionIdFromToken(token)).toBe('abc-123');
  });
  it('token inválido → null', () => {
    expect(sessionIdFromToken('lixo')).toBeNull();
    expect(sessionIdFromToken(null)).toBeNull();
    expect(sessionIdFromToken('a.!!!.c')).toBeNull();
  });
});
