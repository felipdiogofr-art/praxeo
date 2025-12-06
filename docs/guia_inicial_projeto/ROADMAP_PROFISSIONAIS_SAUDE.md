# 🏥 Roadmap: Busca de Profissionais de Saúde

## 📋 Resumo Executivo

Este documento detalha o plano de implementação da funcionalidade de **busca e contratação de profissionais da área da saúde** no marketplace Praxeo.

### Objetivo
Expandir o Praxeo de um marketplace de equipamentos médicos para uma plataforma completa que também conecta pacientes/clientes com profissionais de saúde qualificados na região.

---

## 🎯 Funcionalidades Principais

### 1. Busca de Profissionais
- Busca por especialidade (Enfermeiro, Cuidador, Médico, Fisioterapeuta, etc.)
- Busca por localização (geolocalização)
- Filtros: disponibilidade, preço, avaliação, verificação
- Lista de profissionais com cards informativos

### 2. Perfil do Profissional
- Informações completas do profissional
- Certificações e credenciais (CR/CRM/COREN)
- Especialidades e experiência
- Disponibilidade (calendário)
- Avaliações e comentários de clientes
- Badge de verificação

### 3. Sistema de Agendamento
- Solicitação de agendamento por cliente
- Aprovação/recusa pelo profissional
- Confirmação de data e hora
- Gerenciamento de disponibilidade

### 4. Sistema de Verificação
- Upload de documentos profissionais
- Verificação manual pela equipe Praxeo
- Badge de "Profissional Verificado"

---

## 🏗️ Arquitetura Proposta

### Tipos de Profissionais Suportados

| Tipo | Credencial | Exemplo |
|------|------------|---------|
| Enfermeiro | COREN | COREN-12345 |
| Médico | CRM | CRM-12345 |
| Fisioterapeuta | CREFITO | CREFITO-12345 |
| Cuidador | - | (sem registro obrigatório) |
| Nutricionista | CRN | CRN-12345 |
| Psicólogo | CRP | CRP-12345 |

### Modelo de Dados Simplificado

```
Profissional
├── Dados Pessoais
│   ├── Nome
│   ├── Email
│   └── Telefone
├── Dados Profissionais
│   ├── Especialidade
│   ├── Credencial (CR/CRM/COREN)
│   ├── Experiência (anos)
│   └── Bio/Descrição
├── Localização
│   ├── Endereço
│   ├── Latitude
│   └── Longitude
├── Disponibilidade
│   ├── Horários de trabalho
│   └── Dias da semana
├── Preços
│   ├── Valor/hora
│   └── Tipo de serviço
└── Verificação
    ├── Status (verificado/não verificado)
    └── Documentos anexados
```

---

## 📱 Interface do Usuário

### Fluxo de Busca

```
1. Usuário acessa "Buscar Profissionais"
   ↓
2. Seleciona especialidade e localização
   ↓
3. Visualiza lista de profissionais
   ↓
4. Clica em um profissional
   ↓
5. Vê detalhes completos
   ↓
6. Solicita agendamento
   ↓
7. Profissional confirma/recusa
   ↓
8. Agendamento confirmado
```

### Componentes Principais

#### 1. ProfessionalCard
```jsx
<ProfessionalCard
  name="Dr. João Silva"
  specialty="Fisioterapeuta"
  license="CREFITO-12345"
  verified={true}
  rating={4.8}
  distance="2.5 km"
  hourlyRate="R$ 80,00"
  image="..."
/>
```

#### 2. ProfessionalDetail
- Galeria de fotos
- Informações profissionais
- Certificações
- Calendário de disponibilidade
- Avaliações
- Botão "Solicitar Agendamento"

#### 3. AppointmentCalendar
- Seleção de data
- Horários disponíveis
- Horários ocupados (bloqueados)
- Duração do serviço

---

## 🔧 Implementação Técnica

### Backend - Endpoints Necessários

#### Profissionais
```
GET    /api/professionals
       Query params: specialty, lat, lng, radius, verified, minRating
       
GET    /api/professionals/:id
       Retorna detalhes completos do profissional

POST   /api/professionals
       Cria perfil profissional (autenticado)

PUT    /api/professionals/:id
       Atualiza perfil (autenticado)
```

#### Especialidades
```
GET    /api/specialties
       Lista todas as especialidades disponíveis
```

#### Agendamentos
```
GET    /api/appointments
       Lista agendamentos do usuário logado

POST   /api/appointments
       Cria solicitação de agendamento
       Body: { professionalId, date, time, serviceType, notes }

PUT    /api/appointments/:id/confirm
       Profissional confirma agendamento

PUT    /api/appointments/:id/cancel
       Cancela agendamento
```

#### Disponibilidade
```
GET    /api/professionals/:id/availability
       Query params: startDate, endDate
       Retorna horários disponíveis no período

PUT    /api/professionals/:id/availability
       Atualiza horários de disponibilidade
```

---

### Frontend - Páginas Necessárias

#### 1. `/profissionais` - Busca de Profissionais
```
- Barra de busca (especialidade + localização)
- Filtros laterais
- Grid de ProfessionalCard
- Paginação
```

#### 2. `/profissional/:id` - Detalhes do Profissional
```
- Hero com foto e informações principais
- Seções: Sobre, Especialidades, Disponibilidade, Avaliações
- Formulário de agendamento
```

#### 3. `/agendamento/:id` - Página de Agendamento
```
- Seleção de data/hora
- Tipo de serviço
- Localização (domiciliar/clínica/online)
- Resumo e confirmação
```

---

## 📊 Diferenças: Equipamentos vs. Profissionais

| Aspecto | Equipamentos | Profissionais |
|---------|--------------|---------------|
| **Busca** | Por nome/categoria | Por especialidade |
| **Disponibilidade** | Por datas (bloqueio de período) | Por horários específicos |
| **Localização** | Fixa (onde está o equipamento) | Pode ser móvel (atendimento domiciliar) |
| **Reserva/Agendamento** | Reserva de item | Agendamento de serviço |
| **Verificação** | Verificação do proprietário | Verificação de credencial profissional |
| **Avaliação** | Avaliação do equipamento/aluguel | Avaliação do profissional/serviço |

---

## 🎨 Design e UX

### Integração no Header

Opções de implementação:

**Opção 1: Toggle de Busca**
```
[Buscar Equipamentos] [Buscar Profissionais]
```

**Opção 2: Dropdown Unificado**
```
Buscar: [Equipamentos ▼] ou [Profissionais ▼]
```

**Opção 3: Menu Separado**
```
Equipamentos | Profissionais | Como Funciona | Ajuda
```

**Recomendação:** Opção 1 (Toggle) - mais claro e direto.

### Homepage

Sugestão: Abas/Tabs
```
[Equipamentos Médicos]  [Profissionais de Saúde]
```

Cada aba mostra sua própria HeroSection e busca específica.

---

## 🔐 Regras de Negócio

### Verificação de Profissionais

**Processo:**
1. Profissional cria conta e preenche perfil
2. Upload de documento de identificação (RG/CPF)
3. Upload de registro profissional (CR/CRM/COREN)
4. Equipe Praxeo verifica documentos
5. Aprovação → Badge "Profissional Verificado"
6. Rejeição → Feedback e possibilidade de correção

**Critérios de Verificação:**
- Documento de identificação válido
- Registro profissional válido (consultar conselho)
- Foto do profissional
- Informações consistentes

### Agendamentos

**Fluxo:**
1. Cliente seleciona profissional e horário
2. Cliente preenche formulário de agendamento
3. Profissional recebe notificação
4. Profissional pode:
   - Aceitar
   - Recusar (com motivo)
   - Sugerir outro horário
5. Cliente recebe confirmação
6. Opcional: Pagamento antecipado

**Cancelamento:**
- Cliente pode cancelar até 24h antes
- Profissional pode cancelar até 48h antes (com justificativa)
- Cancelamentos frequentes podem resultar em restrições

---

## 📅 Cronograma de Implementação

### Sprint 1 (2 semanas) - Backend Base
- [ ] Criar modelos de dados (Professional, Specialty, Appointment)
- [ ] Migrations do banco de dados
- [ ] Endpoints básicos de CRUD
- [ ] Sistema de verificação (estrutura inicial)

### Sprint 2 (2 semanas) - Backend Avançado
- [ ] Busca com geolocalização
- [ ] Sistema de disponibilidade
- [ ] API de agendamentos
- [ ] Upload de documentos

### Sprint 3 (2 semanas) - Frontend Base
- [ ] Página de busca de profissionais
- [ ] ProfessionalCard component
- [ ] Página de detalhes do profissional
- [ ] Integração com API

### Sprint 4 (2 semanas) - Frontend Avançado
- [ ] Sistema de agendamento
- [ ] AppointmentCalendar component
- [ ] Dashboard do profissional
- [ ] Notificações básicas

### Sprint 5 (1 semana) - Polimento
- [ ] Testes
- [ ] Ajustes de UX
- [ ] Documentação
- [ ] Deploy

**Total:** ~9 semanas (~2 meses)

---

## 🚀 Próximos Passos Imediatos

### Esta Semana
1. ✅ Criar plano detalhado (este documento)
2. ⏳ Revisar e aprovar arquitetura proposta
3. ⏳ Definir especialidades iniciais a suportar
4. ⏳ Criar mockups/wireframes básicos

### Próxima Semana
1. ⏳ Iniciar implementação do backend
2. ⏳ Criar modelos de dados
3. ⏳ Configurar banco de dados
4. ⏳ Primeiros endpoints de teste

---

## ⚠️ Considerações Importantes

### Legais
- Verificar requisitos legais para plataforma de profissionais
- Termos de uso específicos para profissionais
- Política de responsabilidade
- LGPD (tratamento de dados sensíveis)

### Técnicas
- Escalabilidade do sistema de busca
- Performance com muitos profissionais
- Cache de buscas frequentes
- Otimização de geolocalização

### Negócio
- Modelo de comissão para profissionais (se houver)
- Processo de verificação manual (custo/recursos)
- Suporte a profissionais
- Estratégia de onboarding

---

## 📚 Referências

### Aplicativos Similares
- **Doctoralia**: Busca de médicos e agendamento
- **iClinic**: Gestão de clínicas e profissionais
- **GetNinjas**: Marketplace de serviços (inclui saúde)
- **Zocdoc**: Agendamento de profissionais de saúde (EUA)

### Documentação Útil
- [COREN - Conselho Regional de Enfermagem](https://www.coren-sp.gov.br/)
- [CFM - Conselho Federal de Medicina](https://portal.cfm.org.br/)
- [CREFITO - Conselho Regional de Fisioterapia](https://crefito.gov.br/)

---

## ✅ Checklist de MVP

### Backend
- [ ] Modelos de dados criados
- [ ] API de profissionais funcionando
- [ ] Busca com geolocalização
- [ ] Sistema de agendamentos básico
- [ ] Upload de documentos

### Frontend
- [ ] Página de busca de profissionais
- [ ] Página de detalhes
- [ ] Sistema de agendamento
- [ ] Integração completa com backend

### Validação
- [ ] Testes manuais
- [ ] Feedback de usuários beta
- [ ] Correções e ajustes

---

**Versão:** 1.0  
**Última atualização:** Dezembro 2024  
**Status:** 📝 Planejamento Concluído - Pronto para Implementação



