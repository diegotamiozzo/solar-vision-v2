document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('solarForm');
    const steps = Array.from(document.querySelectorAll('.step'));
    const progress = document.getElementById('formProgress');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const resultsDiv = document.getElementById('results');
    const modal = document.getElementById('privacyModal');
    
    let currentStep = 0;

    function initForm() {
        showStep(currentStep);
        updateProgress();
        setupEventListeners();
        setupModal();
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        prevBtn.hidden = stepIndex === 0;
        nextBtn.textContent = stepIndex === steps.length - 1 ? 'Enviar para simulação' : 'Próximo';

        updateProgress();
    }

    function updateProgress() {
        const progressPercentage = ((currentStep + 1) / steps.length) * 100;
        progress.style.width = `${progressPercentage}%`;
    }

    function validateStep(step) {
        const inputs = step.querySelectorAll('input:not([type="hidden"]), select');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                isValid = false;
                highlightError(input);
            }

            if (input.type === 'email' && input.value && !validateEmail(input.value)) {
                isValid = false;
                highlightError(input);
                alert('Por favor, insira um e-mail válido.');
            }

            if (input.type === 'tel' && input.value && !validatePhoneNumber(input.value)) {
                isValid = false;
                highlightError(input);
                alert('Por favor, insira um número de telefone válido (10 ou 11 dígitos).');
            }
        });

        if (step.id === 'step1' && !document.getElementById('installationType').value) {
            isValid = false;
            alert('Por favor, selecione um tipo de instalação');
        }

        if (step.id === 'step7' && !document.getElementById('privacyAgreement').checked) {
            isValid = false;
            alert('Por favor, concorde com a política de privacidade para continuar.');
        }

        return isValid;
    }

    function highlightError(input) {
        input.classList.add('error');
        input.addEventListener('input', () => {
            input.classList.remove('error');
        }, { once: true });
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhoneNumber(phone) {
        const phoneDigits = phone.replace(/\D/g, '');
        return phoneDigits.length === 10 || phoneDigits.length === 11;
    }

    function setupEventListeners() {
        const options = document.querySelectorAll('.option');
        const installationInput = document.getElementById('installationType');

        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                installationInput.value = option.dataset.type;
            });

            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });

        const locationBtn = document.querySelector('.location-btn');
        locationBtn?.addEventListener('click', getCurrentLocation);

        prevBtn?.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });

        nextBtn?.addEventListener('click', () => {
            if (currentStep < steps.length - 1) {
                if (validateStep(steps[currentStep])) {
                    currentStep++;
                    showStep(currentStep);
                }
            } else {
                if (validateStep(steps[currentStep])) {
                    handleSubmit();
                }
            }
        });

        const phoneInput = document.getElementById('phone');
        phoneInput?.addEventListener('input', formatPhoneNumber);
    }

    function setupModal() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        const modalClose = document.querySelector('.modal-close');

        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.dataset.modal;
                const modal = document.getElementById(`${modalId}Modal`);
                if (modal) {
                    modal.classList.add('active');
                }
            });
        });

        modalClose?.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    async function getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Geolocalização não é suportada pelo seu navegador.');
            return;
        }

        const locationInput = document.getElementById('location');

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );

            if (!response.ok) {
                throw new Error('Erro ao obter localização');
            }

            const data = await response.json();
            locationInput.value = data.address.city || data.address.town || data.display_name;
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Não foi possível obter sua localização. Por favor, digite manualmente.');
        }
    }

    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
    
        // Trunca para 11 dígitos se necessário
        if (value.length > 11) {
            e.target.value = value.slice(0, 11);
            value = e.target.value;
        }
    
        let formattedValue = "";
        if(value.length <= 2) {
            formattedValue = value;
        } else if(value.length > 2) {
            formattedValue = `(${value.slice(0,2)}) ${value.slice(2)}`;
        }
    
        if(value.length > 9 && value.length <= 10) {
            formattedValue = `${formattedValue.slice(0,9)}-${formattedValue.slice(9)}`;
        } else if(value.length > 10) {
            formattedValue = `${formattedValue.slice(0,10)}-${formattedValue.slice(10)}`;
        }
    
        e.target.value = formattedValue;
    }

    // Exibe os dados
    function handleSubmit() {
        if (!validateStep(steps[currentStep])) {
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Exibir os resultados na tela (Simulação)
        exibirSimulacao(data);

        // Enviar os dados inseridos para o Google Sheets
        enviarParaPlanilha(data);
    }

    // Função para exibir os cálculos da simulação
    function exibirSimulacao(data) {
        const consumoMensal = parseFloat(data.monthlyBill);    
        console.log('Consumo Mensal Capturado:', consumoMensal);

        if (isNaN(consumoMensal) || consumoMensal <= 0) {
            alert('Por favor, insira um valor válido para o consumo mensal.');
            return;
        }

        // Constantes do sistema solar
        const MEDIA_SOL_DIARIA = 4.1;
        const POTENCIA_PLACA = 570;
        const AREA_PLACA = 2.4;
        const VALOR_KWH = 0.72;

        // Cálculos
        const consumoMensalKWh = consumoMensal / VALOR_KWH;
        const potenciaNecessariaKW = consumoMensalKWh / (MEDIA_SOL_DIARIA * 30);
        const numPlacas = Math.ceil(potenciaNecessariaKW * 1000 / POTENCIA_PLACA);
        const potenciaInstalada = (numPlacas * POTENCIA_PLACA) / 1000;
        const producaoMensal = potenciaInstalada * MEDIA_SOL_DIARIA * 30;
        const areaNecessaria = numPlacas * AREA_PLACA;

        // Exibir os resultados
        form.style.display = 'none';
        resultsDiv.style.display = 'block';

        resultsDiv.innerHTML = `
            <h2>Resultado da Simulação</h2>
           <ul>
                <section class="step active" id="step1">
                    <div class="options-grid">
                        <div class="option">
                            <img src="/img/potencia.png" alt="Ícone de Potência" width="90" height="90">
                            <span><strong>Potência Instalada:</strong> ${potenciaInstalada.toFixed(2)} kWp</span>
                        </div>
                        <div class="option">
                            <img src="/img/placas.png" alt="Ícone de Placas" width="90" height="90">
                            <span><strong>Número de Placas:</strong> ${numPlacas}</span>
                        </div>
                        <div class="option">
                            <img src="/img/area.png" alt="Ícone de Área" width="90" height="90">
                            <span><strong>Área Mínima Necessária:</strong> ${areaNecessaria.toFixed(2)} m²</span>
                        </div>
                        <div class="option">
                            <img src="/img/producao.png" alt="Ícone de Produção" width="90" height="90">
                            <span><strong>Produção Mensal Estimada:</strong> ${producaoMensal.toFixed(2)} kWh/mês</span>
                        </div>
                    </div>
               </section>

           </ul>
            <p>Os valores apresentados são estimativas baseadas em uma simulação e servem apenas como referência, pois fatores como 
            inclinação do telhado, condições climáticas, tipo de fixação e sombras de obstáculos próximos
            podem influenciar o resultado final.<p/>
            <br>
            <p><strong>Para obter uma análise personalizada, entre em contato com um de nossos especialistas</strong></p>
            <button type="button" class="nav-btn" onclick="window.open('https://wa.me/55991661357?text=' + encodeURIComponent('Olá, fiz uma simulação gratuita e gostaria de tirar algumas dúvidas'), '_blank')">
    <i class="fa-brands fa-whatsapp"></i> Falar com Especialista
</button>

        `;

        // Botão para voltar ao formulário
        const backButton = document.createElement('button');
        backButton.textContent = 'Voltar ao Formulário';
        backButton.classList.add('nav-btn');
        backButton.id = 'backToForm';
        
        backButton.addEventListener('click', () => {
            form.style.display = 'block';
            resultsDiv.style.display = 'none';
        });

        resultsDiv.appendChild(backButton);
    }

    // Função para enviar os dados para o Google Sheets
    function enviarParaPlanilha(data) {
        const sheetData = {
            installationType: data.installationType || "N/A",
            location: data.location || "N/A",
            installationLocation: data.installationLocation || "N/A",
            energyProvider: data.energyProvider || "N/A",
            energyType: data.energyType || "N/A",
            monthlyBill: data.monthlyBill || "N/A",
            name: data.name || "N/A",
            email: data.email || "N/A",
            phone: data.phone || "N/A",
            privacyAgreement: data.privacyAgreement ? "Yes" : "No"
        };

        fetch("https://script.google.com/macros/s/AKfycbzSeuCodigoAqui/exec", {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sheetData)
        }).then(response => {
            console.log("Dados enviados ao Google Sheets!");
        }).catch(error => {
            console.error("Erro ao enviar os dados:", error);
        });
    }

    function formatLabel(key) {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
    }

    initForm();
});
