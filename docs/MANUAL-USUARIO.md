# MusicOS — Manual do Usuário

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Documentação em Desenvolvimento

---

## 1. Introdução ao MusicOS

### 1.1 O Que é o MusicOS?

O MusicOS é uma plataforma educacional de música que combina ferramentas de teoria musical, prática instrumental e tecnologia interativa. O sistema oferece:

- **Teoria Musical**: Escalas, acordes, campo harmônico e ciclo de quintas
- **Prática Instrumental**: Fretboard interativo com áudio
- **Educação Contextual**: Explicações em cada seção através do botão "i"
- **Exercícios Guiados**: Progressões de acordes, escalas e técnicas

### 1.2 Como Acessar

1. Acesse [URL do app] no seu navegador
2. Faça login com email ou conta Google
3. Comece a explorar as ferramentas disponíveis

### 1.3 Planos Disponíveis

| Plano | Preço | O Que Inclui |
|-------|-------|--------------|
| **Free** | Grátis | 5 tonalidades, escalas básicas, fretboard |
| **Pro** | R$9,90/mês | Todas as ferramentas, exercícios ilimitados |
| **Lifetime** | R$197 | Pro forever, sem mensalidade |

---

## 2. Guía de Uso por Módulo

### 2.1 Módulo de Escalas

#### Selecionando uma Escala

1. **Escolha a Tônica**: Clique no seletor de notas (C, G, F, A, E para usuários Free)
2. **Escolha o Tipo de Escala**: Maior, Menor, Pentatônica, Blues, etc.
3. **Visualize as Notas**: As notas da escala aparecem destacadas no fretboard

#### Entendendo a Escala

Cada escala tem um padrão específico de intervalos:

```
Escala Maior: T-T-S-T-T-T-S (Tom-Tom-SemiTom)
Exemplo em C: C - D - E - F - G - A - B - C

Escala Menor Natural: T-S-T-T-S-T-T
Exemplo em A: A - B - C - D - E - F - G - A
```

> 💡 **Dica**: Use o botão "i" para entender melhor cada escala

#### Ouvindo a Escala

- Clique em qualquer nota destacada no fretboard para ouvir
- As notas são tocadas pelo motor de áudio Web Audio API

---

### 2.2 Fretboard Interativo

#### Anatomia do Fretboard

```
┌─────────────────────────────────────────────────────────────────┐
│  E │───┬───┤ F ├───┤ G ├───┤ A ├───┤ B │───┌───┐ C ├───┤ D │
│    │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
│  B │───┌───┐├───┤ C ├───┤ D ├───┤ E │───┌───┐├───┤ F ├───┤
│    │   │   ││   │   │   │   │   │   │   │   ││   │   │   │   │
├────┼───┼───┼┴───┴───┴───┴───┴───┴───┴───┴───┴┴───┴───┴───┴───┤
│  G │───┬───┤ A ├───┤ B │───┌───┐ C ├───┤ D ├───┤ E ├───┤ F │
│    │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
│  D ├───┤ E │───┌───┐ F ├───┤ G ├───┤ A ├───┤ B │───┌───┐ C │
│    │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
│  A ├───┤ B │───┌───┐ C ├───┤ D ├───┤ E │───┌───┐ F ├───┤ G │
│    │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
│  E ├───┤ F ├───┤ G ├───┤ A ├───┤ B │───┌───┐ C ├───┤ D ├───┤
│    │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
└────┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

#### Instrumentos Suportados

| Instrumento | Afinação Padrão |
|-------------|-----------------|
| Guitarra 6 cordas | E-A-D-G-B-E (Mi Lá Ré Sol Si Mi) |
| Violão 6 cordas | E-A-D-G-B-E |
| Ukulele Soprano | G-C-E-A |
| Baixo 4 cordas | E-A-D-G |

#### Funcionalidades

- **Destacar Notas**: Notas da escala ativa aparecem em destaque
- **Play por Clique**: Clique em qualquer traste para ouvir a nota
- **Zoom**: Use o scroll ou gestos para ampliar o fretboard
- **Mudar Instrumento**: Selecione outro instrumento no menu

---

### 2.3 Campo Harmônico e Acordes

#### O Que é o Campo Harmônico?

O campo harmônico é o conjunto de acordes formado a partir das notas de uma escala. Em tonalidade de C Maior:

```
Grau:    I      ii      iii     IV      V       vi      viio
Acorde:  C      Dm      Em      F       G       Am      Bdim
Função:  Tônica Subdom  Subdom  Tônica  Domin   Relat.  Diminuta
```

#### Como Usar

1. **Selecione a Tônica**: C, D, E, etc.
2. **Escolha a Escala**: Maior ou Menor
3. **Visualize os Acordes**: Cada acorde mostra diagrama SVG
4. **Toque o Acorde**: Clique no acorde para ouvir

#### Diagramas de Acorde

O diagrama mostra a posição correta dos dedos:

```
Acorde C (Dó maior)

    1   2   3   4   5   6   7   8   9   10  11  12
  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
E │   │   │   │ ● │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
B │   │   │ ● │   │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
G │ ● │ ● │   │ ● │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
D │ ● │   │   │ ● │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
A │ ● │   │   │   │   │   │   │   │   │   │   │   │
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
E │   │   │   │   │   │   │   │   │   │   │   │   │
  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
      C
```

Legenda:
- ● = Traste apertado
- X = Corda não tocada
- Números = Dedos (1=indicador, 2=médio, 3=anelar, 4=mínimo)

---

### 2.4 Metrônomo

#### Para Que Serve o Metrônomo?

O metrônomo estabelece a pulsação constante para prática rítmica. É essencial para:

- Desenvolver senso rítmico
- Manter estabilidade ao tocar
- Aumentar gradualmente a velocidade

#### Configurações

| Parâmetro | Range | Padrão |
|-----------|-------|--------|
| **BPM** | 20-300 | 120 |
| **Compasso** | 2/4, 3/4, 4/4 | 4/4 |
| **Som** | Click, Woodblock, Cowbell | Click |

#### Como Usar

1. **Defina o BPM**: Use os botões + / - ou deslize o slider
2. **Selecione o Compasso**: 4/4 é o mais comum
3. **Ative o Som**: Clique em "Iniciar"
4. **Pratique**: Toca junto com o click

#### Dicas de Prática

- Comece lento (60-80 BPM)
- Aumente 5-10 BPM por semana
- Mantenha precisão, não velocidade
- Use em exercícios de escalas e acordes

---

### 2.5 Sistema Educacional (InfoButton)

#### O Que é o InfoButton?

O botão "i" (🔵) fornece explicações contextuais sobre cada seção:

- **O Que É**: Definição do conceito
- **Como Usar**: Passo a passo prático
- **Exemplos**: Casos de uso reais
- **Dicas**: Otimizações e macetes

#### Onde Encontrar

O InfoButton está disponível em:

- 📐 **Ciclo de Quintas**
- 🎵 **Campo Harmônico**
- 🎼 **Escalas**
- 🎸 **Acordes**
- ⏱️ **Metrônomo**
- 🎯 **Exercícios**

#### Exemplos de Conteúdo

**InfoButton - Ciclo de Quintas:**

```
O QUE É:
O ciclo de quintas é uma representação
visual das relações entre as 12 notas
musicais, onde cada nota é uma 5ª justa
acima da anterior.

COMO USAR:
1. Use para encontrar tonalidades relativas
2. Pratique progressões de acordes
3. Aprenda as progressões IV-V-I

EXEMPLO:
C → G → D → A → E → B → F# → Db → Ab → Eb → Bb → F → C
```

---

### 2.6 Exercícios

#### Tipos de Exercícios

| Tipo | Descrição | Dificuldade |
|------|-----------|-------------|
| **Escalas** | Pratique padrões de escala | Iniciante → Avançado |
| **Acordes** | Progressões para mudanças | Iniciante → Intermediário |
| **Técnicas** | Tapping, hammer-on, bends | Intermediário → Avançado |
| **Guiados** | Com metrônomo integrado | Todos os níveis |

#### Como Fazer um Exercício

1. **Selecione o Exercício**: Escolha da lista disponível
2. **Configure o Metrônomo**: Defina o BPM adequado
3. **Inicie o Player**: Clique em "Começar"
4. **Siga as Instruções**: O player guia a execução
5. **Analise o Progresso**: Veja métricas ao final

#### Exercícios Recomendados para Iniciantes

1. Escala C Maior - Posição 1
2. Progressão I-IV-V-I (C-F-G)
3. Mudança de Dm para G

---

## 3. Configurações do Usuário

### 3.1 Preferências

Acesse: Menu → Configurações → Preferências

| Opção | Descrição |
|-------|-----------|
| **Instrumento Padrão** | Guitarra, Violão, Ukulele, Baixo |
| **Tema** | Escuro (padrão), Claro |
| **Notificações** | Ativar/desativar alertas |
| **Áudio** | Volume, Types de som |

### 3.2 Armazenamento Local

O MusicOS usa LocalStorage para guardar:

- ✅ Preferências do usuário
- ✅ Último arquivo de áudio
- ✅ Cache de progresso

**Limite**: 50MB

Para verificar uso: Menu → Configurações → Armazenamento

---

## 4. Perguntas Frequentes (FAQ)

### Q: Por que só vejo 5 tonalidades?

**R**: O plano Free oferece C, G, F, A e E. Faça upgrade para Pro para todas as 12 tonalidades.

### Q: Como mudo o instrumento?

**R**: Vá em Configurações → Instrumento e selecione o desejado.

### Q: Por que não tenho som?

**R**: Verifique:
1. Volume do computador/mobile
2. Permissão de áudio do navegador
3. Conexão com a internet (para carregar sons)

### Q: Posso usar offline?

**R**: Sim, o PWA permite uso offline básico. Porém, alguns recursos precisam de internet.

### Q: Como faço upgrade para Pro?

**R**: Vá em Menu → Upgrade ou clique no botão "Assinar Pro" na página inicial.

### Q: Minhas preferências são salvas?

**R**: Sim, preferências são salvas automaticamente no LocalStorage do navegador.

### Q: Há exercícios para mão esquerda e direita?

**R**: Os exercícios de técnicas incluem tapping, hammer-on, pull-off e bends para prática de ambas as mãos.

---

## 5. Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Espaço` | Play/Pause metrônomo |
| `+` | Aumentar BPM |
| `-` | Diminuir BPM |
| `M` | Mute/Unmute |
| `S` | Salvar progresso |

---

## 6. Glossário de Termos Musicais

| Termo | Definição |
|-------|-----------|
| **Tônica** | A nota principal de uma tonalidade (1º grau) |
| **Intervalo** | Distância entre duas notas |
| **Acorde** | 3+ notas tocadas simultaneamente |
| **Campo Harmônico** | Conjunto de acordes de uma tonalidade |
| **Escala** | Sequência de notas em ordem ascendente/descendente |
| **BPM** | Batidas por minuto (tempo) |
| **Traste** | Division no braço do instrumento |
| **Hammer-on** | Técnica de transição entre notas |
| **Bend** | Técnica de afinar a nota para cima |
| **Tapping** | Técnica de tapping nas cordas |

---

## 7. Suporte

### Problemas Técnicos

- **Áudio não funciona**: Verifique permissões do navegador
- **Não carrega**: Tente limpar cache do navegador
- **Erro de login**: Verifique conexão com a internet

### Contato

- 📧 Email: suporte@music-os.com
- 📖 Documentação: [URL da docs]
- 🐛 Reportar bugs: [URL do GitHub Issues]

---

*Documento atualizado em 24 de outubro de 2026*  
*Versão 1.0 — Manual do Usuário*