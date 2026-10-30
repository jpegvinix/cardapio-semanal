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

2. Copiar `.env.example` para `.env.local` e definir `ADMIN_SECRET_TOKEN`.

3. Executar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acessar no navegador:
   - **Cardápio público:** `http://localhost:3000/`
   - **Painel de edição:** `http://localhost:3000/editar/<ADMIN_SECRET_TOKEN>`

## ☁️ Deploy na Vercel

O projeto foi construído para funcionar na Vercel com zero dor de cabeça.

### Link de Edição:
Defina `ADMIN_SECRET_TOKEN` em **Settings > Environment Variables** com um valor gerado por `openssl rand -hex 16`. Sem essa variável, ninguém consegue salvar. Para revogar o link, troque o valor e faça um novo deploy.

### Persistência de Dados no Deploy:
Para que o cardápio salvo pela cozinha fique permanentemente gravado na nuvem:
1. No dashboard do seu projeto na Vercel, acesse a aba **Storage**.
2. Clique em **Connect Store** -> Escolha **KV** (ou **Upstash Redis**).
3. Pronto! As variáveis `cardapiosemanal_KV_REST_API_URL` e `cardapiosemanal_KV_REST_API_TOKEN` são configuradas automaticamente. Os nomes sem prefixo (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) também funcionam.

Sem KV na Vercel, o painel mostra erro ao salvar em vez de perder a alteração.

