# Estrutura do App — Requisitos

Status: **aprovado pelo usuário** (respostas registradas abaixo)

## Introdução

O app perdeu a estrutura de produto: a landing page original foi trocada pelo Estúdio, nenhuma rota exige login, o cadastro não cria o perfil e a página `/` passou a usar o layout do MusicPages, que o usuário rejeitou. Esta spec define a estrutura: landing page pública, cadastro e login obrigatórios, área logada com o layout de abas do MusicOS, e onde cada funcionalidade fica.

## Decisões do usuário (registradas)

- O layout da área logada é o **layout de abas do MusicOS** (header com logo e seletor de instrumento, abas, cartões slate). Cópia exata do código aprovado: `referencia/layout-abas-page.tsx`.
- Para usar o app é **obrigatório criar conta e entrar**. O motivo é poder fazer email marketing, lembrar o usuário de usar o app, ensinar as funcionalidades e vender os planos.
- Os Termos de Uso e a Política de Privacidade serão escritos por mim, em nível profissional, para revisão.
- O app deve ter **todas as 24 escalas do MusicPages** (ver Requisito 6).

## Glossário

- **Landing page:** página pública de apresentação e venda, em `/`.
- **Área logada:** páginas do app, só para quem entrou.
- **Layout de abas:** o visual de `referencia/layout-abas-page.tsx`.

## Requisitos

### Requisito 1 — Landing page

1. QUANDO um visitante abrir `/`, O SISTEMA DEVE mostrar a landing page com: apresentação, funcionalidades principais, os planos (lidos do módulo de planos) e rodapé com links para Termos e Privacidade.
2. A landing page DEVE ter os botões "Começar grátis" (cadastro) e "Entrar" (login).
3. QUANDO um usuário logado abrir `/`, o botão "Entrar" DEVE virar "Ir para o app".
4. A landing page DEVE usar o visual do MusicOS (tema escuro slate) e funcionar em celular.

### Requisito 2 — Cadastro

1. O cadastro DEVE pedir nome, email, senha (mínimo 8 caracteres) e aceite obrigatório dos Termos de Uso e da Política de Privacidade.
2. O cadastro DEVE ter uma caixa separada, **desmarcada por padrão**, para aceitar receber emails com dicas, novidades e ofertas (exigência da LGPD para email marketing). O SISTEMA DEVE gravar essa escolha e a data.
3. QUANDO o cadastro for enviado, O SISTEMA DEVE criar a conta e mostrar que o email de confirmação foi enviado.
4. SE o email já existir ou a senha não atender à regra, ENTÃO O SISTEMA DEVE mostrar a mensagem em português ao lado do campo.
5. QUANDO o usuário confirmar o email, O SISTEMA DEVE levá-lo ao login com a mensagem "Email confirmado".

### Requisito 3 — Login e senha

1. O login DEVE pedir email e senha e, ao entrar, levar à página que o usuário tentava abrir ou à aba inicial do app.
2. SE email ou senha estiverem errados, ENTÃO O SISTEMA DEVE mostrar "Email ou senha incorretos".
3. SE o email ainda não foi confirmado, ENTÃO O SISTEMA DEVE dizer isso e oferecer reenviar a confirmação.
4. O login DEVE ter "Esqueci minha senha", que envia um link e leva a uma tela para escolher a nova senha.
5. O usuário DEVE poder sair pelo menu do usuário, voltando à landing page.
6. Os botões de login com Google e GitHub, que hoje não funcionam, DEVEM sair.

### Requisito 4 — Perfil

1. QUANDO uma conta for criada, O SISTEMA DEVE criar automaticamente o perfil (nome, email, plano Free, consentimento de marketing) no Supabase.
2. O header da área logada DEVE mostrar o nome e o plano do usuário.

### Requisito 5 — Proteção das rotas

1. QUANDO um visitante sem login abrir qualquer página da área logada, O SISTEMA DEVE levá-lo ao login e, depois de entrar, voltar à página pedida.
2. QUANDO um usuário logado abrir o login ou o cadastro, O SISTEMA DEVE levá-lo ao app.
3. A verificação DEVE acontecer no servidor (middleware), antes de a página carregar.

### Requisito 6 — Área logada no layout de abas

1. A área logada DEVE usar o layout de abas: header com logo "🎵 MusicOS", subtítulo, seletor de instrumento e menu do usuário (nome, plano, Minha conta, Planos, Sair); abas abaixo do header; conteúdo em cartões `bg-slate-800`; rodapé.
2. As abas DEVEM ser, nesta ordem: **Escalas, Braço, Acordes, Exercícios, Ferramentas**. Cada aba é uma página com endereço próprio, para poder ser aberta direto e voltar com o botão do navegador.
3. Uma barra de seleção logo abaixo das abas DEVE escolher tônica e escala, no mesmo estilo dos botões do layout aprovado. A escolha vale para Escalas, Braço e Acordes e continua ao recarregar.
4. O conteúdo de cada aba:
   - **Escalas:** sonoridade, sentimentos, uso e músicas da escala; círculo de escalas com comparação; tabela de intervalos; notas da escala e campo harmônico (tríades e tétrades); teclado com som.
   - **Braço:** braço com escala colorida; CAGED com as formas F e B e as formas menores; só pentatônica; destacar acorde; intervalos. Mesmo conteúdo da aba Braço aprovada.
   - **Acordes:** visualizador do campo harmônico com as posições do banco do MusicPages e som ao clicar.
   - **Exercícios:** spec `exercicios`.
   - **Ferramentas:** metrônomo, afinador, ciclo de quintas, estruturas de escalas.
5. O SISTEMA DEVE oferecer as 24 escalas do MusicPages, nos quatro grupos: diatônicas (Maior, Menor Natural, Menor Harmônica, Menor Melódica); modos gregos (Jônio, Dórico, Frígio, Lídio, Mixolídio, Eólio, Lócrio); outras (Pentatônica Maior, Pentatônica Menor, Blues Maior, Blues Menor, Diminuta T-S, Diminuta S-T, Tons Inteiros, Cromática); exóticas (Egípcia, Hirajoshi, Iwato, Man Gong, Ritusen). As que o plano não libera aparecem com cadeado (spec `planos-e-assinaturas`).
6. O visual de cada aba DEVE ser aprovado pelo usuário a partir de fotos das telas antes de a tarefa ser considerada pronta.

### Requisito 7 — Minha conta

1. A página Minha conta DEVE mostrar nome, email, plano e a área de assinatura (spec `planos-e-assinaturas`).
2. O usuário DEVE poder trocar o nome, a senha e a escolha de receber emails de marketing.

### Requisito 8 — Páginas legais

1. O SISTEMA DEVE ter as páginas `/termos` e `/privacidade`, em nível profissional e de acordo com a LGPD, com links no cadastro, na landing page e no rodapé do app.
2. Os textos DEVEM indicar a data da última atualização e os dados da empresa (razão social, CNPJ, email de contato), que ficam marcados como pendentes até o usuário informar.

### Requisito 9 — Limpeza

1. QUANDO as funcionalidades estiverem nas abas, O SISTEMA DEVE remover o Estúdio provisório de `/`, as páginas antigas do `/dashboard` com menu lateral, as demos (`/dashboard/instruments/demo`, `/dashboard/scales/demo`) e os componentes que ficarem sem uso.

## Fora do escopo desta spec

Envio automático de emails de engajamento e marketing (lembretes, sequência de boas-vindas): vira a spec `emails-e-engajamento`. Login com Google, excluir conta pelo app, tema claro, outros idiomas.

## Perguntas em aberto

Nenhuma bloqueante. Os dados da empresa para os Termos (razão social, CNPJ, email) podem ser informados depois.
