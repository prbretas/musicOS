# Exercícios — Requisitos

Status: **aprovado pelo usuário** (respostas registradas abaixo)

## Introdução

Hoje a aba de exercícios é só um catálogo fixo: itens com descrição, instruções genéricas e um botão "concluído" que se perde ao recarregar. Nenhum exercício é praticável. Esta spec define exercícios de verdade, com som, metrônomo, pontuação e progresso salvo, reaproveitando o sintetizador (`lib/audio/synth.ts`), a lógica do metrônomo, o braço com CAGED (`lib/music/caged.ts`), as escalas e o campo harmônico (`lib/music/escalas.ts`) e o banco de posições de acordes (`lib/music/chord-shapes.ts`).

Origem: `docs/requirements.md` (RF-EXE), `src/app-MusicOS/docs/issues.md` (EXS, EXC, GUI) e `src/app-MusicOS/docs/EDUCATIONAL.md`.

## Decisões do usuário (registradas)

- Fazer os exercícios **incluindo os de ritmo**, considerados fundamentais.
- O app exige login, então o progresso é sempre gravado na conta do usuário.
- Pentatônica e blues dos exercícios de escala: **menores** (recomendação aceita).

## Glossário

- **Sessão:** uma execução completa de um exercício.
- **Nível:** Iniciante, Intermediário ou Avançado.
- **Posição:** região do braço de um desenho CAGED.
- **Batida:** uma resposta do usuário no exercício de ritmo (tecla ou toque na tela).

## Requisitos

### Requisito 1 — Catálogo

1. QUANDO o usuário abrir a aba Exercícios, O SISTEMA DEVE listar os exercícios das categorias **Treino Auditivo, Escalas, Progressões e Ritmo**.
2. Cada exercício DEVE mostrar: nome, categoria, nível, duração estimada, melhor resultado e data da última prática.
3. O usuário DEVE poder filtrar por categoria e por nível.
4. QUANDO o exercício não estiver no plano do usuário, O SISTEMA DEVE mostrar cadeado e o plano que o libera; ao clicar, abrir a tela de planos.
5. QUANDO o usuário clicar num exercício liberado, O SISTEMA DEVE abrir a página do exercício, com endereço próprio.

### Requisito 2 — Treino auditivo: intervalos

1. QUANDO uma sessão começar, O SISTEMA DEVE sortear 10 perguntas, cada uma com nota base aleatória entre C3 e C5 e um intervalo do conjunto do nível:
   - Iniciante: 2ª maior, 3ª maior, 4ª justa, 5ª justa, 8ª justa.
   - Intermediário: os do Iniciante mais 2ª menor, 3ª menor, 6ª menor, 6ª maior.
   - Avançado: os 12 intervalos de 2ª menor a 8ª justa, incluindo o trítono.
2. O SISTEMA DEVE tocar as duas notas em sequência ascendente nos níveis Iniciante e Intermediário. No Avançado, deve sortear ascendente, descendente ou simultâneo, e informar qual foi tocado.
3. QUANDO o usuário clicar em "Ouvir de novo", O SISTEMA DEVE repetir o som sem contar erro.
4. QUANDO o usuário responder, O SISTEMA DEVE indicar acerto ou erro por texto e cor, mostrar o intervalo correto e as notas (por exemplo "C → G, 5ª justa") e liberar a próxima pergunta.
5. QUANDO a 10ª pergunta for respondida, O SISTEMA DEVE mostrar o resultado (acertos de 10), os intervalos errados e os botões "Repetir" e "Voltar ao catálogo".

### Requisito 3 — Treino auditivo: acordes

1. Conjuntos:
   - Iniciante: maior e menor.
   - Intermediário: maior, menor, diminuto, aumentado.
   - Avançado: Maj7, m7, 7, m7b5, dim7.
2. O SISTEMA DEVE tocar o acorde com fundamental aleatória entre C3 e B3: notas juntas e depois arpejadas.
3. Valem os critérios 1, 3, 4 e 5 do Requisito 2 (10 perguntas, ouvir de novo, retorno, resultado).

### Requisito 4 — Escala guiada no braço

1. Exercícios, para guitarra em afinação padrão:
   - EXS-001 a EXS-004: escala de C maior nas posições 1 a 4.
   - EXS-005: pentatônica menor de C, posição 1.
   - EXS-006: blues menor de C, posição 1.
2. As posições vêm dos desenhos CAGED de `lib/music/caged.ts`, em ordem de casa. C maior: posição 1 = forma C (casas 0–3), 2 = forma A (2–6), 3 = forma G (4–8), 4 = forma E (7–11). Pentatônica e blues menores de C: posição 1 = forma Em (casas 7–11).
3. A sequência de notas DEVE ir da mais grave à mais aguda, corda por corda, sem repetir a mesma casa, e depois descer de volta.
4. QUANDO o usuário clicar em Iniciar, O SISTEMA DEVE dar 4 batidas de contagem e então avançar uma nota por batida, destacando no braço a nota atual e, com outra cor, a próxima.
5. Andamento ajustável entre 40 e 200 BPM, antes e durante o exercício; inicial 60.
6. Opção "Tocar junto" (ligada por padrão): toca o som de cada nota no tempo.
7. O SISTEMA DEVE contar repetições (uma subida e uma descida) e encerrar ao atingir o número escolhido (padrão 4, de 1 a 20).
8. Pausar mantém a posição; Continuar retoma do mesmo ponto.

### Requisito 5 — Progressões de acordes

1. Exercícios:
   - EXC-001: I-IV-V-I
   - EXC-002: ii-V-I
   - EXC-003: I-vi-IV-V
   - EXC-004: I-iii-IV-V
2. A tonalidade inicial é C; o usuário pode trocar para as tonalidades que o plano libera, e os acordes são recalculados pelo campo harmônico.
3. O SISTEMA DEVE mostrar o diagrama do acorde atual (banco `chord-shapes.ts`) em destaque e o próximo ao lado, menor.
4. Troca de acorde a cada compasso de 4 tempos, com contagem de 4 batidas antes e o tempo atual do compasso visível.
5. Com "Tocar junto" ligado, O SISTEMA DEVE tocar o acorde no primeiro tempo de cada compasso.
6. Andamento entre 40 e 160 BPM (inicial 70) e número de voltas (padrão 4).

### Requisito 6 — Ritmo

1. Exercícios:
   - RIT-001 Pulsação (Iniciante): bater em todos os tempos.
   - RIT-002 Colcheias (Iniciante): duas batidas por tempo.
   - RIT-003 Contratempo (Intermediário): bater só entre os tempos.
   - RIT-004 Síncope (Intermediário): colcheia, semínima, colcheia em cada dois tempos.
   - RIT-005 Semicolcheias e pausas (Avançado): padrão de semicolcheias com pausas.
   - RIT-006 Polirritmia 3 contra 2 (Avançado): duas mãos ao mesmo tempo.
   - RIT-007 Polirritmia 4 contra 3 (Avançado): duas mãos ao mesmo tempo.
2. O SISTEMA DEVE mostrar o compasso como uma grade de tempos e subdivisões, com as batidas esperadas marcadas e um cursor que anda no tempo do metrônomo.
3. O usuário bate com a tecla **Espaço** ou tocando numa área grande da tela. Nas polirritmias, usa **F** (mão esquerda) e **J** (mão direita), ou dois botões no celular.
4. O SISTEMA DEVE comparar cada batida com a batida esperada mais próxima e classificar a diferença: até 35 ms "Perfeito", até 75 ms "Bom", até 130 ms "Fraco"; acima disso, ou batida esperada sem resposta, "Perdeu". Batida sem par conta como "Fora do tempo".
5. Ao final, O SISTEMA DEVE mostrar a nota de 0 a 100 (Perfeito vale 1, Bom 0,7, Fraco 0,3, os demais 0, dividido pelo total esperado, com batidas fora do tempo descontando), a contagem de cada classificação e se o usuário tende a adiantar ou atrasar, em média, em milissegundos.
6. Cada sessão tem 4 compassos no Iniciante e 8 nos demais, depois de 1 compasso de contagem. Andamento entre 50 e 160 BPM, inicial 80.
7. **Calibração:** antes do primeiro exercício de ritmo, O SISTEMA DEVE pedir ao usuário que bata junto com 8 cliques, calcular o atraso médio do aparelho e descontá-lo das batidas. O usuário pode refazer a calibração quando quiser. O valor fica salvo no navegador.

### Requisito 7 — Progresso

1. QUANDO uma sessão terminar, O SISTEMA DEVE registrar: exercício, nível, data e hora, duração, resultado e andamento.
2. O registro DEVE ser gravado no Supabase, visível só para o próprio usuário.
3. SE a gravação falhar, ENTÃO O SISTEMA DEVE guardar o registro no navegador e reenviá-lo na próxima vez que a aba Exercícios abrir.
4. O catálogo DEVE mostrar o melhor resultado e a última prática de cada exercício, a partir desses registros.
5. Sessão interrompida não é registrada.

### Requisito 8 — Acesso por plano

1. O SISTEMA DEVE consultar o plano pelo módulo único de planos (spec `planos-e-assinaturas`).
2. Divisão (segue o Requisito 2 da spec de planos, a aprovar lá):

| Recurso | Free | Plus | Pro e Vitalício |
|---|---|---|---|
| Exercícios liberados | 1 por categoria, nível Iniciante (intervalos, EXS-001, EXC-001, RIT-001) | níveis Iniciante e Intermediário | todos |
| Tonalidades nas progressões | C | 7 naturais | 12 |
| Progresso salvo | sim | sim | sim |

### Requisito 9 — Uso e acessibilidade

1. Treino auditivo pelo teclado: teclas 1 a 9 para responder, Enter para a próxima, R para ouvir de novo.
2. Acerto e erro indicados por texto além da cor.
3. Funcionar em celular (largura mínima 360 px); o braço pode rolar na horizontal.
4. O som só começa após um clique do usuário.

## Fora do escopo desta spec

Exercícios de técnica (EXT-001 a 006), gerador aleatório (GER-001 a 004), conquistas e dias seguidos, ukulele nos exercícios de braço, reconhecimento do som pelo microfone.

## Perguntas em aberto

Nenhuma bloqueante. A divisão por plano depende da aprovação do Requisito 2 da spec `planos-e-assinaturas`; até lá, o módulo de planos usa a proposta.
