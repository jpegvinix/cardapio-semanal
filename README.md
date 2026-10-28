# 🍲 Cardápio Semanal da Cozinha

Sistema web simples, rápido e responsivo para manter e consultar o cardápio semanal da empresa, desenvolvido conforme os requisitos do PRD.

## ✨ Principais Funcionalidades

- **Cardápio Público (`/`)**:
  - Exibe os dias da semana (Segunda a Sexta) com as respectivas datas no fuso horário brasileiro.
  - **Destaque automático do dia atual ("Hoje")** para os colaboradores saberem a refeição na hora.
  - 4 categorias organizadas: *Prato Principal*, *Guarnição*, *Salada* e *Sobremesa*.
  - Categorias vazias são omitidas automaticamente para manter a visualização limpa.
  - Navegação entre semanas (semana atual, próxima semana).
  - 100% responsivo para celulares e computadores.

- **Painel de Edição da Cozinha (`/editar/[token]`)**:
  - Acesso direto via link seguro (sem login ou senhas complexas).
  - Campos de preenchimento intuitivos para cada refeição.
  - Possibilidade de planejar a próxima semana com antecedência.
  - Botão de **Copiar link do cardápio** para compartilhar no WhatsApp da empresa ou mural.
  - Feedback visual imediato (*Salvando...*, *Salvo!*, *Erro*).

## 🚀 Como Rodar Localmente

1. Instalar as dependências:
   ```bash
   npm install
   ```

2. Executar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acessar no navegador:
   - **Cardápio público:** `http://localhost:3000/`
   - **Painel de edição:** `http://localhost:3000/editar/cozinha-admin-2026`

## ☁️ Deploy na Vercel

O projeto foi construído para funcionar na Vercel com zero dor de cabeça.

### Persistência de Dados no Deploy:
Para que o cardápio salvo pela cozinha fique permanentemente gravado na nuvem:
1. No dashboard do seu projeto na Vercel, acesse a aba **Storage**.
2. Clique em **Connect Store** -> Escolha **KV** (ou **Upstash Redis**).
3. Pronto! As variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` são configuradas automaticamente.

