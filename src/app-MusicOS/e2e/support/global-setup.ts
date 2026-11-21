/**
 * Aquecimento: em `npm run dev` a pagina so compila no primeiro acesso, o que
 * pode passar do tempo limite de um teste. Antes de rodar os testes, pede cada
 * rota uma vez e espera responder. No CI (build de producao) isso e instantaneo.
 */
const ROUTES = ['/'];
const BASE = 'http://localhost:3000';

export default async function globalSetup() {
  for (const route of ROUTES) {
    const deadline = Date.now() + 240_000;
    for (;;) {
      try {
        const res = await fetch(BASE + route);
        if (res.ok) break;
      } catch {
        // servidor ainda subindo
      }
      if (Date.now() > deadline) throw new Error(`a rota ${route} nao respondeu em 4 minutos`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
