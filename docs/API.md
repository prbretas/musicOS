# MusicOS — Especificação de APIs

> **Versão:** 1.0  
> **Data:** 24 de outubro de 2026  
> **Status:** Aprovado  
> **Formato:** OpenAPI 3.0

---

## 1. Visão Geral

Esta especificação documenta todas as APIs externas do MusicOS, incluindo endpoints REST do Next.js e integrações com serviços externos.

---

## 2. Autenticação

### 2.1 Login

```yaml
POST /api/auth/login
Description: Autentica usuário com email e senha
Tags: [Auth]

Request Body:
  type: object
  required: [email, password]
  properties:
    email:
      type: string
      format: email
      example: "usuario@email.com"
    password:
      type: string
      minLength: 8
      example: "senha123"

Responses:
  200:
    description: Login bem-sucedido
    content:
      application/json:
        schema:
          type: object
          properties:
            user:
              $ref: '#/components/schemas/User'
            session:
              $ref: '#/components/schemas/Session'
            token:
              type: string

  400:
    description: Credenciais inválidas
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'

  401:
    description: Email ou senha incorretos
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

### 2.2 Registro

```yaml
POST /api/auth/register
Description: Cria nova conta de usuário
Tags: [Auth]

Request Body:
  type: object
  required: [email, password, fullName]
  properties:
    email:
      type: string
      format: email
      example: "usuario@email.com"
    password:
      type: string
      minLength: 8
      example: "senha123"
    fullName:
      type: string
      minLength: 2
      example: "João Silva"

Responses:
  201:
    description: Conta criada com sucesso
    content:
      application/json:
        schema:
          type: object
          properties:
            user:
              $ref: '#/components/schemas/User'
            message:
              type: string
              example: "Conta criada. Verifique seu email."

  400:
    description: Dados inválidos ou email já existente
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

### 2.3 Logout

```yaml
POST /api/auth/logout
Description: Faz logout do usuário
Tags: [Auth]

Security:
  - BearerAuth: []

Responses:
  200:
    description: Logout bem-sucedido

  401:
    description: Não autenticado
```

### 2.4 Session

```yaml
GET /api/auth/session
Description: Retorna a sessão atual do usuário
Tags: [Auth]

Security:
  - BearerAuth: []

Responses:
  200:
    description: Sessão ativa
    content:
      application/json:
        schema:
          type: object
          properties:
            user:
              $ref: '#/components/schemas/User'
            session:
              $ref: '#/components/schemas/Session'

  401:
    description: Não autenticado
```

---

## 3. Stripe Checkout

### 3.1 Criar Sessão de Checkout

```yaml
POST /api/stripe/checkout
Description: Cria sessão de checkout do Stripe
Tags: [Stripe]

Security:
  - BearerAuth: []

Request Body:
  type: object
  required: [priceId, successUrl, cancelUrl]
  properties:
    priceId:
      type: string
      description: ID do preço no Stripe
      example: "price_123456"
    successUrl:
      type: string
      format: uri
      example: "https://music-os.com/success"
    cancelUrl:
      type: string
      format: uri
      example: "https://music-os.com/pricing"

Responses:
  200:
    description: Sessão de checkout criada
    content:
      application/json:
        schema:
          type: object
          properties:
            sessionId:
              type: string
              example: "cs_test_xxx"
            url:
              type: string
              format: uri
              example: "https://checkout.stripe.com/xxx"

  400:
    description: Erro ao criar sessão
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'

  401:
    description: Não autenticado
```

### 3.2 Portal do Cliente

```yaml
POST /api/stripe/portal
Description: Cria link para portal de gerenciamento de assinatura
Tags: [Stripe]

Security:
  - BearerAuth: []

Responses:
  200:
    description: URL do portal
    content:
      application/json:
        schema:
          type: object
          properties:
            url:
              type: string
              format: uri
              example: "https://billing.stripe.com/xxx"

  401:
    description: Não autenticado
```

### 3.3 Webhook do Stripe

```yaml
POST /api/webhooks/stripe
Description: Recebe eventos do Stripe
Tags: [Webhooks]

Request Body:
  type: object
  required: [type, data]
  properties:
    id:
      type: string
      example: "evt_xxx"
    type:
      type: string
      enum:
        - checkout.session.completed
        - customer.subscription.created
        - customer.subscription.updated
        - customer.subscription.deleted
        - invoice.payment_succeeded
        - invoice.payment_failed
    data:
      type: object
      properties:
        object:
          type: object
          properties:
            customer_email:
              type: string
            subscription:
              type: string
            status:
              type: string

Headers:
  stripe-signature:
    type: string
    required: true
    description: Assinatura do webhook

Responses:
  200:
    description: Webhook processado
    content:
      text/plain:
        schema:
          type: string
          example: "ok"

  400:
    description: Assinatura inválida
    content:
      text/plain:
        schema:
          type: string
          example: "error"
```

---

## 4. Usuário

### 4.1 Perfil

```yaml
GET /api/user/profile
Description: Retorna perfil do usuário logado
Tags: [User]

Security:
  - BearerAuth: []

Responses:
  200:
    description: Perfil do usuário
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/UserProfile'

  401:
    description: Não autenticado
```

### 4.2 Preferências

```yaml
GET /api/user/preferences
Description: Retorna preferências do usuário
Tags: [User]

Security:
  - BearerAuth: []

Responses:
  200:
    description: Preferências do usuário
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/UserPreferences'

  401:
    description: Não autenticado
```

```yaml
PUT /api/user/preferences
Description: Atualiza preferências do usuário
Tags: [User]

Security:
  - BearerAuth: []

Request Body:
  type: object
  properties:
    defaultInstrument:
      type: string
      enum: [guitarra-6, violao-12, ukulele, baixo-4, baixo-5]
    theme:
      type: string
      enum: [light, dark, system]
    showNoteNames:
      type: boolean
    showFretNumbers:
      type: boolean
    audioTimbre:
      type: string
      enum: [sine, square, sawtooth, triangle]

Responses:
  200:
    description: Preferências atualizadas
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/UserPreferences'

  400:
    description: Dados inválidos

  401:
    description: Não autenticado
```

---

## 5. Exercícios

### 5.1 Listar Exercícios

```yaml
GET /api/exercises
Description: Lista exercícios disponíveis
Tags: [Exercises]

Query Parameters:
  - name: type
    in: query
    schema:
      type: string
      enum: [scale, chord-progression, technique, licks, ear-training]
  - name: difficulty
    in: query
    schema:
      type: string
      enum: [beginner, intermediate, advanced]
  - name: tonic
    in: query
    schema:
      type: string
      example: "C"
  - name: limit
    in: query
    schema:
      type: integer
      default: 20

Responses:
  200:
    description: Lista de exercícios
    content:
      application/json:
        schema:
          type: object
          properties:
            exercises:
              type: array
              items:
                $ref: '#/components/schemas/Exercise'
            total:
              type: integer
            page:
              type: integer
```

### 5.2 Detalhes do Exercício

```yaml
GET /api/exercises/{id}
Description: Retorna detalhes de um exercício
Tags: [Exercises]

Parameters:
  - name: id
    in: path
    required: true
    schema:
      type: string
      example: "scale-c-major-1"

Responses:
  200:
    description: Detalhes do exercício
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/ExerciseDetail'

  404:
    description: Exercício não encontrado
```

### 5.3 Completar Exercício

```yaml
POST /api/exercises/{id}/complete
Description: Registra conclusão de exercício
Tags: [Exercises]

Security:
  - BearerAuth: []

Parameters:
  - name: id
    in: path
    required: true
    schema:
      type: string

Request Body:
  type: object
  properties:
    durationSeconds:
      type: integer
      example: 120
    score:
      type: integer
      example: 85
    notes:
      type: string

Responses:
  200:
    description: Exercício registrado
    content:
      application/json:
        schema:
          type: object
          properties:
            streak:
              type: integer
              example: 5
            xpEarned:
              type: integer
              example: 50

  401:
    description: Não autenticado
```

---

## 6. Componentes de Esquema

### 6.1 Schemas Base

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440000"
        email:
          type: string
          format: email
          example: "usuario@email.com"
        fullName:
          type: string
          example: "João Silva"
        avatarUrl:
          type: string
          format: uri
        subscriptionTier:
          type: string
          enum: [free, pro, lifetime]
        createdAt:
          type: string
          format: date-time

    UserProfile:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        stats:
          type: object
          properties:
            totalExercises:
              type: integer
            totalMinutes:
              type: integer
            currentStreak:
              type: integer
            longestStreak:
              type: integer

    UserPreferences:
      type: object
      properties:
        defaultInstrument:
          type: string
          enum: [guitarra-6, violao-12, ukulele, baixo-4, baixo-5]
        theme:
          type: string
          enum: [light, dark, system]
        showNoteNames:
          type: boolean
          default: true
        showFretNumbers:
          type: boolean
          default: true
        audioTimbre:
          type: string
          enum: [sine, square, sawtooth, triangle]
          default: sine
        audioVolume:
          type: number
          minimum: 0
          maximum: 1
          default: 0.7

    Session:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        expiresAt:
          type: string
          format: date-time

    Exercise:
      type: object
      properties:
        id:
          type: string
          example: "scale-c-major-1"
        type:
          type: string
          enum: [scale, chord-progression, technique, licks, ear-training]
        title:
          type: string
          example: "Escala C Maior - Posição 1"
        description:
          type: string
        difficulty:
          type: string
          enum: [beginner, intermediate, advanced]
        tempo:
          type: integer
          example: 60
        duration:
          type: integer
          description: Duração estimada em minutos
        tonic:
          type: string
          example: "C"
        scaleType:
          type: string
          example: "maior"

    ExerciseDetail:
      type: object
      properties:
        exercise:
          $ref: '#/components/schemas/Exercise'
        steps:
          type: array
          items:
            type: object
            properties:
              instruction:
                type: string
              note:
                type: string
              duration:
                type: integer
        tips:
          type: array
          items:
            type: string
        relatedExercises:
          type: array
          items:
            type: string

    Error:
      type: object
      properties:
        code:
          type: string
          example: "VALIDATION_ERROR"
        message:
          type: string
          example: "Dados inválidos"
        details:
          type: object

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## 7. Códigos de Erro

| Código | HTTP Status | Descrição |
|--------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Dados de entrada inválidos |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `CONFLICT` | 409 | Conflito (ex: email já existe) |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |
| `RATE_LIMITED` | 429 | Muitas requisições |
| `SUBSCRIPTION_REQUIRED` | 403 | Necessita assinatura Pro |

---

*Documento aprovado em 24 de outubro de 2026*  
*Versão 1.0*