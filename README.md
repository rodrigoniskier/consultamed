# ConsultaMed

### Plataforma web para gestão de agenda ambulatorial e fluxos de atendimento

**ConsultaMed** é uma aplicação React/TypeScript para organizar agendas clínicas com diferentes perfis de acesso. O sistema reúne cadastro de pacientes, escalas médicas, especialidades, locais de atendimento e acompanhamento das consultas em uma interface responsiva.

**Demo:** https://consultamed-mocha.vercel.app

## O que o projeto demonstra

- autenticação com Supabase Auth;
- autorização por perfis de usuário;
- persistência em PostgreSQL via Supabase;
- dashboards específicos por função;
- CRUD de pacientes, especialidades, escalas e consultas;
- atualização em tempo real da agenda do médico;
- interface responsiva para desktop e dispositivos móveis;
- PWA;
- deploy em Vercel;
- configuração por variáveis de ambiente.

## Perfis de acesso

A aplicação trabalha com três papéis:

- **secretaria** — administração operacional da agenda;
- **secretaria_pacientes** — criação de pacientes e agendamentos;
- **medico** — visualização da própria agenda e registro de status/notas.

> A interface não é a fronteira de segurança. Em produção, as permissões devem ser aplicadas também no banco via **Row Level Security (RLS)**.

## Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Supabase Auth**
- **PostgreSQL / Supabase**
- **React Router**
- **Tailwind CSS**
- **date-fns**
- **Vercel**

## Executar localmente

```bash
git clone https://github.com/rodrigoniskier/consultamed.git
cd consultamed
npm install
cp .env.example .env.local
npm run dev
```

Configure:

```dotenv
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-chave-anon"
```

A chave `anon` do Supabase é própria para uso no cliente; a proteção dos dados depende de RLS corretamente configurado. **Nunca use a service role key no frontend.**

## Segurança

O repositório inclui:

- exemplo de ambiente sem credenciais reais;
- headers de segurança no deploy Vercel;
- política de divulgação de vulnerabilidades em [SECURITY.md](SECURITY.md);
- configuração de atualizações automatizadas de dependências;
- roteiro SQL em [supabase/security_hardening.sql](supabase/security_hardening.sql) para auditar/endurecer RLS.

Antes de utilizar dados reais de pacientes, revise e aplique as políticas de banco adequadas ao seu ambiente.

## Compatibilidade com deploy existente

A estrutura do repositório, a branch `main`, os scripts de build e o fluxo normal de atualização por Git foram preservados. As alterações de portfólio e segurança não exigem mudança no comando usual de `git pull`.

## Portfólio

Este projeto demonstra construção de uma aplicação de domínio com **autenticação, papéis de usuário, banco relacional, dados em tempo real e regras de negócio**.

---

Desenvolvido por [Rodrigo Niskier](https://github.com/rodrigoniskier).
