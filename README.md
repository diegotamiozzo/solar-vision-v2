# Simulador de Energia Solar ☀️

Aplicação web para simular a instalação de sistemas de energia solar fotovoltaica, calculando o número de placas necessárias, potência instalada e estimativa de produção mensal.

## 🚀 Funcionalidades

- Formulário interativo multi-etapas com barra de progresso
- Seleção de tipo de instalação (Residencial, Empresarial, Agronegócio, Sem rede)
- Geolocalização automática do usuário
- Cálculo de potência necessária e número de placas solares
- Estimativa de área mínima e produção mensal de energia
- Integração com Google Sheets para armazenamento de dados
- Design responsivo e acessível

## 🛠️ Tecnologias

- HTML5
- CSS3 (com variáveis CSS)
- JavaScript
- Font Awesome (ícones)
- Google Fonts (Poppins)
- API Nominatim (geolocalização)
- Google Apps Script (integração com planilhas)

## 📋 Estrutura do Projeto

```
├── index.html
├── project/
│   ├── script.js
│   └── style.css
├── img/
│   └── (imagens do projeto)
└── README.md
```

## 🔧 Instalação

1. Clone o repositório
```bash
git clone https://github.com/diegotamiozzo/solar-vision-v2.git 
```

2. Abra o arquivo `index.html` em um navegador

Não é necessário instalar dependências, o projeto utiliza apenas CDNs externas.

## 💡 Como Usar

1. Selecione o tipo de instalação desejado
2. Informe a localização da instalação
3. Escolha o local de instalação (solo, telhado ou carport)
4. Selecione sua concessionária de energia
5. Informe o tipo de entrada de energia
6. Digite seu gasto médio mensal com energia elétrica
7. Preencha seus dados de contato
8. Visualize os resultados da simulação

## 📊 Cálculos

O simulador utiliza as seguintes constantes:
- Média de sol diária: 4.1 horas
- Potência por placa: 570W
- Área por placa: 2.4 m²
- Valor médio do kWh: R$ 0,72

## 🔒 Privacidade

Os dados coletados são armazenados de forma segura e não são compartilhados com terceiros. Consulte a Política de Privacidade no aplicativo para mais informações.

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- Desktops
- Tablets
- Smartphones

## 👨‍💻 Desenvolvedor

Diego Tamiozzo
