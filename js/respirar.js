/**
 * Pluma - Exercícios de Respiração
 * Técnicas guiadas com animações e sons
 */

class RespiracaoManager {
    constructor() {
        this.tecnicas = {
            '4-7-8': {
                nome: 'Técnica 4-7-8',
                descricao: 'Relaxamento profundo para dormir melhor',
                inspirar: 4,
                segurar: 7,
                expirar: 8,
                ciclos: 4
            },
            'box': {
                nome: 'Respiração Quadrada',
                descricao: 'Equilíbrio e foco mental',
                inspirar: 4,
                segurar: 4,
                expirar: 4,
                segurar2: 4,
                ciclos: 4
            },
            'relaxante': {
                nome: 'Respiração Relaxante',
                descricao: 'Alívio rápido de estresse',
                inspirar: 4,
                segurar: 2,
                expirar: 6,
                ciclos: 6
            },
            'energizante': {
                nome: 'Respiração Energizante',
                descricao: 'Despertar e energizar',
                inspirar: 2,
                expirar: 2,
                ciclos: 10
            }
        };

        this.tecnicaAtual = null;
        this.isRunning = false;
        this.isPaused = false;
        this.cicloAtual = 0;
        this.faseAtual = '';
        this.tempoRestante = 0;
        this.intervalo = null;
        this.somAtivo = true;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTecnicas();
    }

    setupEventListeners() {
        // Seleção de técnica
        document.querySelectorAll('.tecnica-card').forEach(card => {
            card.addEventListener('click', () => {
                const tecnica = card.dataset.tecnica;
                this.selecionarTecnica(tecnica);
            });
        });

        // Controles
        const btnIniciar = document.getElementById('btn-iniciar');
        const btnPausar = document.getElementById('btn-pausar');
        const btnParar = document.getElementById('btn-parar');
        const btnSom = document.getElementById('btn-som');

        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => this.iniciar());
        }
        if (btnPausar) {
            btnPausar.addEventListener('click', () => this.pausar());
        }
        if (btnParar) {
            btnParar.addEventListener('click', () => this.parar());
        }
        if (btnSom) {
            btnSom.addEventListener('click', () => this.toggleSom());
        }
    }

    renderTecnicas() {
        const container = document.getElementById('tecnicas-lista');
        if (!container) return;

        container.innerHTML = Object.entries(this.tecnicas).map(([key, tecnica]) => `
            <div class="tecnica-card" data-tecnica="${key}">
                <div class="tecnica-icon">${this.getTecnicaIcon(key)}</div>
                <h3>${tecnica.nome}</h3>
                <p>${tecnica.descricao}</p>
                <div class="tecnica-tempos">
                    <span>Inspirar: ${tecnica.inspirar}s</span>
                    ${tecnica.segurar ? `<span>Segurar: ${tecnica.segurar}s</span>` : ''}
                    <span>Expirar: ${tecnica.expirar}s</span>
                    ${tecnica.segurar2 ? `<span>Segurar: ${tecnica.segurar2}s</span>` : ''}
                </div>
                <span class="tecnica-ciclos">${tecnica.ciclos} ciclos</span>
            </div>
        `).join('');

        // Re-attach event listeners
        document.querySelectorAll('.tecnica-card').forEach(card => {
            card.addEventListener('click', () => {
                const tecnica = card.dataset.tecnica;
                this.selecionarTecnica(tecnica);
            });
        });
    }

    getTecnicaIcon(key) {
        const icons = {
            '4-7-8': '🌙',
            'box': '⬜',
            'relaxante': '🍃',
            'energizante': '⚡'
        };
        return icons[key] || '🌬️';
    }

    selecionarTecnica(key) {
        this.tecnicaAtual = this.tecnicas[key];
        this.tecnicaAtual.key = key;
        
        // Atualizar UI
        document.querySelectorAll('.tecnica-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.tecnica === key) {
                card.classList.add('selected');
            }
        });

        // Mostrar controles
        const controles = document.getElementById('controles-respiracao');
        if (controles) {
            controles.classList.add('visible');
        }

        // Atualizar info
        const infoTecnica = document.getElementById('info-tecnica');
        if (infoTecnica) {
            infoTecnica.innerHTML = `
                <h3>${this.tecnicaAtual.nome}</h3>
                <p>${this.tecnicaAtual.descricao}</p>
            `;
        }

        this.resetUI();
    }

    iniciar() {
        if (!this.tecnicaAtual) {
            alert('Selecione uma técnica primeiro');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.cicloAtual = 1;
        
        this.updateControles();
        this.executarCiclo();
    }

    pausar() {
        this.isPaused = !this.isPaused;
        
        const btnPausar = document.getElementById('btn-pausar');
        if (btnPausar) {
            btnPausar.innerHTML = this.isPaused ? `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Continuar
            ` : `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Pausar
            `;
        }
    }

    parar() {
        this.isRunning = false;
        this.isPaused = false;
        this.cicloAtual = 0;
        
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }

        this.resetUI();
        this.updateControles();
    }

    toggleSom() {
        this.somAtivo = !this.somAtivo;
        
        const btnSom = document.getElementById('btn-som');
        if (btnSom) {
            btnSom.innerHTML = this.somAtivo ? '🔊' : '🔇';
            btnSom.classList.toggle('muted', !this.somAtivo);
        }
    }

    async executarCiclo() {
        const tecnica = this.tecnicaAtual;

        while (this.cicloAtual <= tecnica.ciclos && this.isRunning) {
            // Inspirar
            await this.executarFase('inspirar', tecnica.inspirar);
            if (!this.isRunning) break;

            // Segurar (se existir)
            if (tecnica.segurar) {
                await this.executarFase('segurar', tecnica.segurar);
                if (!this.isRunning) break;
            }

            // Expirar
            await this.executarFase('expirar', tecnica.expirar);
            if (!this.isRunning) break;

            // Segurar 2 (box breathing)
            if (tecnica.segurar2) {
                await this.executarFase('segurar', tecnica.segurar2);
                if (!this.isRunning) break;
            }

            this.cicloAtual++;
            this.updateCicloUI();
        }

        if (this.isRunning) {
            this.concluirExercicio();
        }
    }

    executarFase(fase, duracao) {
        return new Promise((resolve) => {
            this.faseAtual = fase;
            this.tempoRestante = duracao;
            
            this.updateFaseUI();
            this.playSound(fase);

            const circle = document.getElementById('breathing-circle');
            if (circle) {
                circle.className = 'breathing-circle ' + fase;
                circle.style.animationDuration = duracao + 's';
            }

            this.intervalo = setInterval(() => {
                if (this.isPaused) return;

                this.tempoRestante--;
                this.updateTempoUI();

                if (this.tempoRestante <= 0) {
                    clearInterval(this.intervalo);
                    resolve();
                }
            }, 1000);
        });
    }

    updateFaseUI() {
        const instrucao = document.getElementById('instrucao');
        if (instrucao) {
            const textos = {
                'inspirar': 'Inspire pelo nariz...',
                'segurar': 'Segure o ar...',
                'expirar': 'Expire lentamente...'
            };
            instrucao.textContent = textos[this.faseAtual] || '';
            instrucao.className = 'instrucao ' + this.faseAtual;
        }
    }

    updateTempoUI() {
        const tempo = document.getElementById('tempo-restante');
        if (tempo) {
            tempo.textContent = this.tempoRestante;
        }
    }

    updateCicloUI() {
        const ciclos = document.getElementById('ciclos-contador');
        if (ciclos) {
            ciclos.textContent = `Ciclo ${this.cicloAtual} de ${this.tecnicaAtual.ciclos}`;
        }
    }

    updateControles() {
        const btnIniciar = document.getElementById('btn-iniciar');
        const btnPausar = document.getElementById('btn-pausar');
        const btnParar = document.getElementById('btn-parar');

        if (btnIniciar) {
            btnIniciar.style.display = this.isRunning ? 'none' : 'flex';
        }
        if (btnPausar) {
            btnPausar.style.display = this.isRunning ? 'flex' : 'none';
        }
        if (btnParar) {
            btnParar.style.display = this.isRunning ? 'flex' : 'none';
        }
    }

    resetUI() {
        const circle = document.getElementById('breathing-circle');
        if (circle) {
            circle.className = 'breathing-circle';
        }

        const instrucao = document.getElementById('instrucao');
        if (instrucao) {
            instrucao.textContent = 'Pressione iniciar quando estiver pronto';
            instrucao.className = 'instrucao';
        }

        const tempo = document.getElementById('tempo-restante');
        if (tempo) {
            tempo.textContent = '-';
        }

        const ciclos = document.getElementById('ciclos-contador');
        if (ciclos && this.tecnicaAtual) {
            ciclos.textContent = `0 de ${this.tecnicaAtual.ciclos} ciclos`;
        }
    }

    playSound(fase) {
        if (!this.somAtivo) return;

        // Usar Web Audio API para sons simples
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const frequencias = {
                'inspirar': 440,
                'segurar': 523,
                'expirar': 330
            };

            oscillator.frequency.value = frequencias[fase] || 440;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Silenciar erros de áudio
        }
    }

    concluirExercicio() {
        this.isRunning = false;
        
        const instrucao = document.getElementById('instrucao');
        if (instrucao) {
            instrucao.textContent = 'Exercício concluído! Como você se sente?';
            instrucao.className = 'instrucao concluido';
        }

        const circle = document.getElementById('breathing-circle');
        if (circle) {
            circle.className = 'breathing-circle concluido';
        }

        this.updateControles();
        this.salvarSessao();
        this.mostrarFeedback();
    }

    salvarSessao() {
        const sessoes = JSON.parse(localStorage.getItem('pluma_respiracao_sessoes') || '[]');
        sessoes.push({
            id: Date.now().toString(),
            tecnica: this.tecnicaAtual.key,
            nome: this.tecnicaAtual.nome,
            data: new Date().toISOString(),
            ciclos: this.tecnicaAtual.ciclos
        });
        localStorage.setItem('pluma_respiracao_sessoes', JSON.stringify(sessoes));
    }

    mostrarFeedback() {
        const feedback = document.getElementById('feedback-modal');
        if (feedback) {
            feedback.classList.add('visible');
        }
    }
}

// Timer de Meditação Simples
class TimerMeditacao {
    constructor() {
        this.minutos = 5;
        this.segundos = 0;
        this.isRunning = false;
        this.intervalo = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const btnMais = document.getElementById('timer-mais');
        const btnMenos = document.getElementById('timer-menos');
        const btnIniciar = document.getElementById('timer-iniciar');

        if (btnMais) {
            btnMais.addEventListener('click', () => this.ajustarTempo(1));
        }
        if (btnMenos) {
            btnMenos.addEventListener('click', () => this.ajustarTempo(-1));
        }
        if (btnIniciar) {
            btnIniciar.addEventListener('click', () => this.toggle());
        }
    }

    ajustarTempo(delta) {
        if (this.isRunning) return;
        
        this.minutos = Math.max(1, Math.min(60, this.minutos + delta));
        this.updateDisplay();
    }

    toggle() {
        if (this.isRunning) {
            this.pausar();
        } else {
            this.iniciar();
        }
    }

    iniciar() {
        this.isRunning = true;
        this.segundos = this.minutos * 60;
        
        const btn = document.getElementById('timer-iniciar');
        if (btn) btn.textContent = 'Pausar';

        this.intervalo = setInterval(() => {
            this.segundos--;
            this.updateDisplay();

            if (this.segundos <= 0) {
                this.concluir();
            }
        }, 1000);
    }

    pausar() {
        this.isRunning = false;
        clearInterval(this.intervalo);
        
        const btn = document.getElementById('timer-iniciar');
        if (btn) btn.textContent = 'Continuar';
    }

    concluir() {
        this.isRunning = false;
        clearInterval(this.intervalo);
        
        // Som de conclusão
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 528;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 2);
        } catch (e) {}

        const btn = document.getElementById('timer-iniciar');
        if (btn) btn.textContent = 'Iniciar';
        
        this.minutos = 5;
        this.updateDisplay();

        alert('Meditação concluída! Namastê 🙏');
    }

    updateDisplay() {
        const display = document.getElementById('timer-display');
        if (display) {
            const mins = Math.floor(this.segundos / 60);
            const secs = this.segundos % 60;
            display.textContent = this.isRunning 
                ? `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : `${this.minutos} min`;
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new RespiracaoManager();
    new TimerMeditacao();
});
