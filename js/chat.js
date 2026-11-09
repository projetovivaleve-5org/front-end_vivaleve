/**
 * Pluma - Chat com IA
 * Assistente de saúde mental com respostas empáticas
 */

class ChatManager {
    constructor() {
        this.mensagens = [];
        this.isTyping = false;
        this.nomeUsuario = localStorage.getItem('pluma_user_name') || 'Amigo';
        
        // Respostas pré-definidas (simulando IA)
        this.respostas = {
            saudacao: [
                `Olá, ${this.nomeUsuario}! Como você está se sentindo hoje? Estou aqui para ouvir.`,
                `Oi! Que bom te ver por aqui. Como posso te ajudar hoje?`,
                `Olá! Espero que esteja tendo um bom dia. Do que gostaria de conversar?`
            ],
            tristeza: [
                `Sinto muito que você esteja passando por isso. Lembre-se que é normal sentir tristeza às vezes. Quer me contar mais sobre o que está acontecendo?`,
                `Obrigado por compartilhar isso comigo. A tristeza faz parte da vida, mas não precisa enfrentá-la sozinho. O que está pesando no seu coração?`,
                `Entendo como você se sente. Momentos difíceis passam, mesmo que não pareça agora. Estou aqui para te ouvir.`
            ],
            ansiedade: [
                `A ansiedade pode ser muito desconfortável. Vamos tentar um exercício de respiração juntos? Inspire por 4 segundos, segure por 4 e expire por 4.`,
                `Percebo que está ansioso. Lembre-se: você já superou momentos difíceis antes e vai superar esse também. Que tal focar no momento presente?`,
                `A ansiedade é como uma onda - ela vem, mas também vai embora. Vamos encontrar formas de surfar essa onda juntos?`
            ],
            estresse: [
                `O estresse pode ser muito cansativo. Você tem conseguido descansar? Às vezes uma pausa pequena já faz diferença.`,
                `Entendo que está sob pressão. Vamos identificar uma pequena coisa que você pode fazer agora para se sentir um pouco melhor?`,
                `Quando tudo parece demais, é importante lembrar: você não precisa resolver tudo de uma vez. Um passo de cada vez.`
            ],
            positivo: [
                `Que maravilha saber que você está bem! O que está contribuindo para esse bom momento?`,
                `Fico muito feliz em ouvir isso! Aproveite esse momento e guarde essa energia positiva.`,
                `Excelente! Momentos assim são preciosos. O que você fez para chegar até aqui?`
            ],
            ajuda: [
                `Estou aqui para conversar e te apoiar. Você pode me contar como está se sentindo, fazer exercícios de respiração, ou simplesmente desabafar.`,
                `Posso te ajudar de várias formas: conversando, sugerindo técnicas de relaxamento, ou apenas sendo uma companhia. O que você prefere?`,
                `Você pode compartilhar qualquer coisa comigo. Não estou aqui para julgar, apenas para ouvir e apoiar.`
            ],
            padrao: [
                `Obrigado por compartilhar. Quer me contar mais sobre isso?`,
                `Entendo. Como isso te faz sentir?`,
                `Interessante. O que mais você gostaria de falar sobre isso?`,
                `Estou ouvindo. Continue, por favor.`,
                `Agradeço por confiar em mim. Como posso te ajudar com isso?`
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.carregarHistorico();
        this.enviarMensagemBot(this.getRandomResponse('saudacao'));
    }

    setupEventListeners() {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const btnEnviar = document.getElementById('btn-enviar');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarMensagem();
            });
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.enviarMensagem();
                }
            });

            input.addEventListener('input', () => {
                this.ajustarAlturaInput();
            });
        }

        // Sugestões rápidas
        document.querySelectorAll('.sugestao-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const texto = btn.dataset.texto;
                if (input) {
                    input.value = texto;
                    this.enviarMensagem();
                }
            });
        });

        // Limpar histórico
        const btnLimpar = document.getElementById('btn-limpar-chat');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => this.limparHistorico());
        }
    }

    ajustarAlturaInput() {
        const input = document.getElementById('chat-input');
        if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        }
    }

    enviarMensagem() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const texto = input.value.trim();
        if (!texto || this.isTyping) return;

        // Adicionar mensagem do usuário
        this.adicionarMensagem('usuario', texto);
        input.value = '';
        this.ajustarAlturaInput();

        // Simular resposta da IA
        this.simularResposta(texto);
    }

    adicionarMensagem(tipo, texto) {
        const mensagem = {
            id: Date.now().toString(),
            tipo: tipo,
            texto: texto,
            timestamp: new Date().toISOString()
        };

        this.mensagens.push(mensagem);
        this.renderMensagem(mensagem);
        this.salvarHistorico();
        this.scrollToBottom();
    }

    renderMensagem(mensagem) {
        const container = document.getElementById('chat-mensagens');
        if (!container) return;

        const hora = new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const div = document.createElement('div');
        div.className = `mensagem mensagem-${mensagem.tipo}`;
        div.innerHTML = `
            <div class="mensagem-conteudo">
                ${mensagem.tipo === 'bot' ? '<div class="bot-avatar">🪶</div>' : ''}
                <div class="mensagem-texto">${this.formatarTexto(mensagem.texto)}</div>
            </div>
            <span class="mensagem-hora">${hora}</span>
        `;

        container.appendChild(div);
    }

    formatarTexto(texto) {
        // Converter quebras de linha
        return texto.replace(/\n/g, '<br>');
    }

    simularResposta(textoUsuario) {
        this.isTyping = true;
        this.mostrarTyping();

        // Analisar sentimento/intenção
        const categoria = this.analisarTexto(textoUsuario);
        const resposta = this.getRandomResponse(categoria);

        // Simular delay de digitação
        const delay = Math.min(1000 + resposta.length * 20, 3000);

        setTimeout(() => {
            this.esconderTyping();
            this.isTyping = false;
            this.enviarMensagemBot(resposta);
        }, delay);
    }

    analisarTexto(texto) {
        const textoLower = texto.toLowerCase();

        // Palavras-chave para cada categoria
        const categorias = {
            saudacao: ['oi', 'olá', 'ola', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'eai'],
            tristeza: ['triste', 'tristeza', 'chorar', 'chorando', 'deprimido', 'depressão', 'mal', 'péssimo', 'horrível', 'sozinho', 'vazio'],
            ansiedade: ['ansioso', 'ansiosa', 'ansiedade', 'nervoso', 'nervosa', 'preocupado', 'preocupada', 'medo', 'pânico', 'angústia'],
            estresse: ['estresse', 'estressado', 'estressada', 'cansado', 'cansada', 'exausto', 'exausta', 'pressão', 'sobrecarregado'],
            positivo: ['bem', 'ótimo', 'ótima', 'feliz', 'alegre', 'contente', 'maravilhoso', 'incrível', 'animado', 'animada'],
            ajuda: ['ajuda', 'ajudar', 'como funciona', 'o que você faz', 'pode me ajudar', 'preciso de ajuda']
        };

        for (const [categoria, palavras] of Object.entries(categorias)) {
            for (const palavra of palavras) {
                if (textoLower.includes(palavra)) {
                    return categoria;
                }
            }
        }

        return 'padrao';
    }

    getRandomResponse(categoria) {
        const respostas = this.respostas[categoria] || this.respostas.padrao;
        return respostas[Math.floor(Math.random() * respostas.length)];
    }

    enviarMensagemBot(texto) {
        this.adicionarMensagem('bot', texto);
    }

    mostrarTyping() {
        const container = document.getElementById('chat-mensagens');
        if (!container) return;

        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'mensagem mensagem-bot typing';
        typing.innerHTML = `
            <div class="mensagem-conteudo">
                <div class="bot-avatar">🪶</div>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        container.appendChild(typing);
        this.scrollToBottom();
    }

    esconderTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) {
            typing.remove();
        }
    }

    scrollToBottom() {
        const container = document.getElementById('chat-mensagens');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    salvarHistorico() {
        localStorage.setItem('pluma_chat_historico', JSON.stringify(this.mensagens));
    }

    carregarHistorico() {
        const historico = localStorage.getItem('pluma_chat_historico');
        if (historico) {
            this.mensagens = JSON.parse(historico);
            this.mensagens.forEach(msg => this.renderMensagem(msg));
        }
    }

    limparHistorico() {
        if (confirm('Tem certeza que deseja limpar o histórico do chat?')) {
            this.mensagens = [];
            localStorage.removeItem('pluma_chat_historico');
            
            const container = document.getElementById('chat-mensagens');
            if (container) {
                container.innerHTML = '';
            }

            this.enviarMensagemBot(this.getRandomResponse('saudacao'));
        }
    }
}

// Sugestões contextuais
class SugestoesManager {
    constructor() {
        this.sugestoes = [
            { texto: 'Como estou me sentindo', icone: '💭' },
            { texto: 'Preciso desabafar', icone: '💬' },
            { texto: 'Estou ansioso', icone: '😰' },
            { texto: 'Quero relaxar', icone: '🧘' },
            { texto: 'Me ajuda a pensar positivo', icone: '✨' },
            { texto: 'Não sei o que fazer', icone: '🤔' }
        ];

        this.init();
    }

    init() {
        this.renderSugestoes();
    }

    renderSugestoes() {
        const container = document.getElementById('sugestoes-container');
        if (!container) return;

        container.innerHTML = this.sugestoes.map(s => `
            <button class="sugestao-btn" data-texto="${s.texto}">
                <span class="sugestao-icone">${s.icone}</span>
                ${s.texto}
            </button>
        `).join('');

        // Re-attach event listeners
        const chatManager = window.chatManager;
        if (chatManager) {
            document.querySelectorAll('.sugestao-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const input = document.getElementById('chat-input');
                    if (input) {
                        input.value = btn.dataset.texto;
                        chatManager.enviarMensagem();
                    }
                });
            });
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
    new SugestoesManager();
});
