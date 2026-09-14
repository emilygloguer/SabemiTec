# 🐞 Sabemi Pay

Aplicação desenvolvida para o desafio técnico da **Sabemi Tec**, simulando o recebimento, processamento e acompanhamento de notificações de pagamento enviadas por uma instituição financeira parceira.

## Contexto

A aplicação recebe webhooks de pagamento, registra os eventos recebidos e realiza o processamento de forma assíncrona.

O objetivo principal é garantir:

* resposta rápida ao sistema parceiro;
* processamento em background;
* idempotência dos eventos;
* persistência e rastreabilidade;
* acompanhamento do processamento pelo frontend.

### Tecnologias

**Backend**

* .NET 10
* ASP.NET Core
* Entity Framework Core
* PostgreSQL
* BackgroundService

**Frontend**

* Angular
* TypeScript
* RxJS

**Infraestrutura e testes**

* Docker / Docker Compose
* xUnit
* Moq

---

## Principais Funcionalidades

### 🔐 Webhook autenticado

O recebimento dos pagamentos é protegido por API Key através do header:

```http
X-Api-Key: sabemi-challenge-key
```

A chave utilizada possui finalidade exclusivamente demonstrativa.

---

### ⚡ Processamento assíncrono

Ao receber um evento válido, a API:

1. persiste o evento;
2. define seu status como `Pendente`;
3. retorna `202 Accepted`;
4. processa o pagamento posteriormente através de um `BackgroundService`.

```text
Webhook
   │
   ▼
Validação
   │
   ▼
Persistência
   │
   ├──► 202 Accepted
   │
   ▼
Pendente
   │
   ▼
Background Service
   │
   ▼
Sucesso / Erro
```

---

### 🛡️ Idempotência

Cada pagamento possui um identificador único de transação.

A aplicação evita o processamento duplicado tanto por validação na aplicação quanto por restrição de unicidade no banco de dados.

---

### 🗃️ Persistência e rastreabilidade

A solução mantém:

* o histórico dos eventos recebidos;
* payload original;
* status do processamento;
* mensagens de erro;
* estado atualizado do contrato.

Essa separação permite preservar o histórico sem misturá-lo com o estado atual do contrato.

---

### 📊 Dashboard

O frontend permite:

* visualizar pagamentos;
* filtrar por status;
* pesquisar por contrato;
* consultar detalhes da transação;
* acompanhar pagamentos pendentes;
* simular novos pagamentos.

Enquanto um evento estiver pendente, a tela realiza consultas periódicas até a conclusão do processamento.

---

## Cenários

### 01. Dashboard

Visão geral dos pagamentos recebidos e seus respectivos status.

<img width="1600" height="764" alt="image" src="https://github.com/user-attachments/assets/5804d788-bbe0-4548-bffe-af60ac4a8c7d" />


---

### 02. Novo pagamento

Simulação do envio de um novo evento pela própria aplicação.

<img width="1600" height="909" alt="image" src="https://github.com/user-attachments/assets/cad0dbcd-8bab-4797-8bfd-66da911b8fff" />


---

### 03. Pagamento em processamento

Evento recebido e aguardando processamento em background.

<img width="1600" height="903" alt="image" src="https://github.com/user-attachments/assets/21ebe554-665e-47f2-abf0-6360b761efce" />


---

### 04. Pagamento processado

Visualização do resultado após a conclusão do processamento.

<img width="1600" height="907" alt="image" src="https://github.com/user-attachments/assets/85ee5651-fd3d-4974-ae57-45347150ebfc" />

---
