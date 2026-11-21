# Planos e Assinaturas — Requisitos

Status: **aprovado pelo usuário**; ficam em aberto parcelamento, teste grátis e provedor (perguntas 3 a 5)

## Introdução

O MusicOS é vendido em quatro planos. O Free existe para o usuário experimentar; o objetivo é que ele assine. Hoje o código está inconsistente (a tela `/pricing` mostra o vitalício a R$97, o código usa R$197, só existe um plano mensal chamado "Pro", nada é bloqueado e o cadastro não cria o perfil). Esta spec define os planos, o que cada um libera, o pagamento e o bloqueio nas telas.

## Decisões do usuário (registradas)

- Planos: **Free** (teste), **Plus** R$9,90/mês, **Pro** R$19,90/mês, **Vitalício** em pagamento único.
- Vitalício: preço cheio equivalente a **3 anos do Pro** (R$697) e lançamento com **preço promocional equivalente a 18 meses** (R$357). Ver Requisito 11.
- A tabela do Requisito 2 está aprovada.
- Plus libera parte das funcionalidades e parte das tonalidades; Pro libera tudo; Vitalício é tudo para sempre.
- Pagamento por **cartão, Pix e boleto**, como o usuário preferir.
- Para usar o app é obrigatório criar conta e entrar.

## Glossário

- **Direito:** permissão de usar um recurso (por exemplo, "todas as 12 tonalidades").
- **Período pago:** intervalo em que um plano mensal está pago.
- **Checkout:** página de pagamento do provedor.
- **Provedor de pagamento:** empresa que processa o pagamento (escolhida no design: Stripe, Mercado Pago ou outra que aceite cartão, Pix e boleto).

## Requisitos

### Requisito 1 — Definição única dos planos

1. O SISTEMA DEVE definir os planos em um único módulo (`lib/plans.ts`), com: identificador (`free`, `plus`, `pro`, `vitalicio`), nome, preço em reais, tipo de cobrança (gratuito, mensal, único), benefícios exibidos e direitos.
2. Toda tela que mostra preço ou benefício DEVE ler desse módulo.
3. Toda verificação de acesso DEVE usar a função de direitos desse módulo, recebendo o plano do usuário e o recurso.

### Requisito 2 — O que cada plano libera

Proposta (a aprovar):

| Recurso | Free (teste) | Plus R$9,90/mês | Pro R$19,90/mês | Vitalício (R$697; lançamento R$357) |
|---|---|---|---|---|
| Tonalidades | só C | 7 naturais (C D E F G A B) | 12 | 12 |
| Escalas (24 do MusicPages) | Maior, Menor natural, Pentatônica menor | diatônicas, modos gregos, pentatônicas e blues (15) | todas as 24, incluindo simétricas e exóticas | todas |
| Tabela de intervalos, notas, teclado | sim | sim | sim | sim |
| Campo harmônico | tríades | tríades e tétrades | tríades e tétrades | tríades e tétrades |
| Braço do instrumento | escala no braço todo | + CAGED, pentatônica, destacar acorde, intervalos | igual ao Plus | igual |
| Visualizador de acordes | 1 posição por acorde | todas as posições | todas | todas |
| Metrônomo, afinador, ciclo de quintas | sim | sim | sim | sim |
| Estruturas de escalas, comparar escalas | não | sim | sim | sim |
| Exercícios | 1 por categoria, nível Iniciante | níveis Iniciante e Intermediário | todos | todos |
| Recursos futuros | — | conforme a tabela | todos, enquanto assinar | todos, para sempre |

### Requisito 3 — Tela de planos

1. O SISTEMA DEVE mostrar os quatro planos lado a lado (empilhados no celular), com preço, cobrança e benefícios lidos do módulo de planos, e o Pro marcado como "Mais completo".
2. QUANDO o usuário estiver logado, O SISTEMA DEVE marcar o plano atual com "Seu plano" e mostrar nos outros "Assinar", "Mudar para este plano" ou "Comprar".
3. QUANDO o visitante não estiver logado e escolher um plano, O SISTEMA DEVE levar ao cadastro e, depois do primeiro login, voltar à compra escolhida.
4. O SISTEMA DEVE mostrar a tabela comparativa do Requisito 2.

### Requisito 4 — Meios de pagamento

1. O SISTEMA DEVE aceitar cartão de crédito, Pix e boleto em todos os planos pagos.
2. Planos mensais pagos no cartão DEVEM renovar automaticamente todo mês.
3. Planos mensais pagos com Pix ou boleto DEVEM liberar 30 dias de acesso por pagamento. O SISTEMA DEVE avisar por email 3 dias antes do fim e oferecer o pagamento do próximo mês.
4. O SISTEMA DEVE liberar o plano assim que o provedor confirmar o pagamento (Pix e cartão em minutos; boleto em até 3 dias úteis), e mostrar "Pagamento pendente" enquanto o boleto não compensa.
5. O preço DEVE ser definido no servidor; o navegador nunca envia o valor.

### Requisito 5 — Assinar ou mudar de plano mensal

1. QUANDO o usuário escolher Plus ou Pro, O SISTEMA DEVE abrir o checkout do provedor com o plano e o meio de pagamento escolhidos.
2. QUANDO o pagamento for confirmado, O SISTEMA DEVE gravar o plano, o meio de pagamento e a data de fim do período, e liberar os recursos sem o usuário precisar sair e entrar.
3. QUANDO um assinante do Plus mudar para o Pro, O SISTEMA DEVE liberar o Pro na hora e cobrar só a diferença proporcional do período atual.
4. QUANDO um assinante do Pro mudar para o Plus, a mudança DEVE valer a partir do próximo período.
5. SE o usuário desistir no checkout, ENTÃO nada muda.

### Requisito 6 — Comprar o Vitalício

1. QUANDO o usuário escolher Vitalício, O SISTEMA DEVE abrir o checkout para pagamento único no preço vigente (Requisito 11).
2. QUANDO o pagamento for confirmado, O SISTEMA DEVE passar o usuário ao Vitalício, sem data de fim.
3. SE o usuário tiver Plus ou Pro com renovação automática, ENTÃO O SISTEMA DEVE cancelar a renovação na mesma confirmação.

### Requisito 7 — Gerenciar, cancelar e falhas

1. A tela Minha conta DEVE mostrar plano, meio de pagamento, próxima cobrança ou data de fim, histórico de pagamentos e os botões "Mudar de plano" e "Cancelar renovação".
2. QUANDO a renovação for cancelada, O SISTEMA DEVE manter o acesso até o fim do período pago e depois passar o usuário ao Free.
3. QUANDO uma cobrança automática falhar, O SISTEMA DEVE avisar no app e por email e manter o acesso durante as novas tentativas do provedor. SE elas acabarem sem pagamento, ENTÃO o usuário passa ao Free.
4. Ao passar ao Free, nada do usuário é apagado (progresso, preferências).

### Requisito 8 — Bloqueio nas telas

1. QUANDO o usuário tentar usar um recurso fora do plano, O SISTEMA DEVE mostrar o recurso com cadeado e a mensagem com o plano que o libera (por exemplo "Disponível no Plus"), com link para a tela de planos.
2. O SISTEMA NÃO DEVE esconder um recurso pago; o usuário deve ver que ele existe.
3. Ações do servidor ligadas a recursos pagos DEVEM verificar o plano também no servidor.

### Requisito 9 — Perfil e plano do usuário

1. QUANDO uma conta for criada, O SISTEMA DEVE criar o perfil com plano Free.
2. O plano DEVE ser lido do servidor; só o servidor pode alterá-lo.
3. O plano atual DEVE aparecer no topo do app e na tela Minha conta.

### Requisito 10 — Segurança e confiabilidade

1. O SISTEMA DEVE verificar a assinatura das notificações (webhooks) do provedor e recusar as que não forem válidas.
2. O mesmo evento recebido duas vezes NÃO DEVE duplicar efeito.
3. As chaves do provedor e do Supabase com privilégio total ficam só no servidor.

### Requisito 11 — Preço do Vitalício e promoção

1. O módulo de planos DEVE guardar o preço cheio do Vitalício (R$697) e, quando houver, o preço promocional (R$357) com data de início e de fim.
2. QUANDO a promoção estiver ativa, O SISTEMA DEVE cobrar o preço promocional e mostrar "Preço de lançamento: R$357 até <data>. Depois, R$697".
3. O SISTEMA NÃO DEVE mostrar "de R$697 por R$357" enquanto o R$697 não tiver sido o preço de venda praticado antes. O Código de Defesa do Consumidor trata como propaganda enganosa o "de/por" com um preço "de" que nunca foi cobrado.
4. A data de fim da promoção é decidida pelo usuário antes do lançamento.

## Fora do escopo desta spec

Cupons, indicação, plano para escolas, plano anual, nota fiscal (processo da empresa), anúncios.

## Perguntas em aberto

1. **Tabela do Requisito 2:** aprova? É o ponto principal desta spec.
2. ~~Preço do Vitalício~~ — decidido: R$697 cheio, R$357 promocional (Requisito 11). Falta a data de fim da promoção.
3. **Parcelamento do Vitalício no cartão** (até 12x)? Recomendação: **sim**; no Brasil, quase todo mundo compra assim.
4. **Teste do Pro ao criar conta:** dar 7 dias de Pro grátis (sem cartão) e depois cair no Free? Recomendação: **sim**, porque mostra o produto completo e aumenta a conversão.
5. **Provedor de pagamento:** a escolha (Stripe ou Mercado Pago) sai no design, depois de checar qual aceita cartão recorrente, Pix e boleto para empresa brasileira. Você já tem conta em algum deles, e tem CNPJ?
