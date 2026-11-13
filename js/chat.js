/**
 * Pluma - Chat com IA
 * Conversa com o back-end (POST /v1/ai/chat), que responde com a IA (Groq).
 * Depende de js/api.js (window.VivaLeveAPI) e precisa do login com token.
 *
 * O back devolve status:
 *  - SUCCESS: resposta da IA
 *  - FALLBACK: IA fora do ar; o texto já é uma mensagem padrão gentil
 *  - CRISIS: frase de risco detectada; mostra a resposta + links do CVV/SAMU
 */

class ChatManager {
    constructor() {
        this.api = window.VivaLeveAPI;
        this.mensagensEl = document.getElementById('chatMessages');
        this.inputEl = document.getElementById('chatInput');
        this.enviarBtn = document.getElementById('sendBtn');
        this.typingEl = document.getElementById('typingIndicator');
        this.boasVindasEl = this.mensagensEl.querySelector('.welcome-message');
        this.enviando = false;

        this.registrarEventos();

        if (this.api.auth.logado()) {
            this.carregarHistorico();
        } else {
            this.pedirLogin();
        }
    }

    registrarEventos() {
        this.inputEl.addEventListener('input', () => {
            this.ajustarAltura();
            this.atualizarBotao();
        });

        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.enviar();
            }
        });

        this.enviarBtn.addEventListener('click', () => this.enviar());

        // Ações rápidas e sugestões usam data-message
        document.querySelectorAll('.quick-action-btn, .suggestion-chip').forEach(btn => {
            btn.addEventListener('click', () => this.enviar(btn.dataset.message));
        });
    }

    async carregarHistorico() {
        try {
            const mensagens = await this.api.ia.historico();
            mensagens
                .filter(m => m.role === 'USER' || m.role === 'ASSISTANT')
                .forEach(m => this.renderMensagem(
                    m.role === 'USER' ? 'user' : 'bot',
                    m.content,
                    m.createdAt,
                    m.status === 'CRISIS'
                ));
        } catch (e) {
            if (e.semLogin) {
                this.pedirLogin();
                return;
            }
            // API fora do ar: o chat abre vazio e o erro aparece ao enviar a primeira mensagem.
            console.warn('[Pluma] Histórico indisponível:', e.message);
        }
    }

    async enviar(textoFixo) {
        const texto = (textoFixo ?? this.inputEl.value).trim();
        if (!texto || this.enviando) return;

        if (!this.api.auth.logado()) {
            this.pedirLogin();
            return;
        }

        this.renderMensagem('user', texto);
        if (textoFixo === undefined) {
            this.inputEl.value = '';
            this.ajustarAltura();
        }

        this.setEnviando(true);
        try {
            const resp = await this.api.ia.conversar(texto);
            this.renderMensagem('bot', resp.reply, resp.createdAt, resp.status === 'CRISIS');
            if (resp.status === 'FALLBACK') {
                console.warn('[Pluma] Resposta padrão (FALLBACK): a IA falhou no back-end. Veja o log "Falha ao chamar Groq".');
            }
        } catch (e) {
            console.error('[Pluma] Erro no chat:', e);
            if (e.semLogin) {
                this.pedirLogin();
                return;
            }
            const msg = e.offline
                ? 'Não consegui me conectar agora. Verifique sua internet e tente de novo.'
                : 'Tive um problema para responder. Tente de novo em instantes.';
            this.renderMensagem('bot', msg + '\n\nSe precisar conversar com alguém agora, o CVV atende 24h pelo 188.');
        } finally {
            this.setEnviando(false);
        }
    }

    /** Sem token (login simulado, token vencido ou "Sair"): explica e leva para o login. */
    pedirLogin() {
        if (this.mensagensEl.querySelector('.chat-login-aviso')) return;

        this.renderMensagem('bot', 'Para conversar comigo, entre com seu email e senha. Assim suas conversas ficam guardadas só para você.');

        const ultima = this.typingEl.previousElementSibling;
        const corpo = ultima && ultima.querySelector('.message-content');
        if (!corpo) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-primary chat-login-aviso';
        btn.style.marginTop = '0.75rem';
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        btn.addEventListener('click', () => {
            this.api.auth.sair();
            window.location.href = 'login.html';
        });
        corpo.appendChild(btn);
    }

    /** tipo: 'user' | 'bot'. Usa textContent para nunca interpretar HTML vindo da IA. */
    renderMensagem(tipo, texto, dataIso, crise = false) {
        if (this.boasVindasEl) {
            this.boasVindasEl.remove();
            this.boasVindasEl = null;
        }

        const msg = document.createElement('div');
        msg.className = `message ${tipo}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = tipo === 'bot' ? '<i class="fas fa-heart"></i>' : '<i class="fas fa-user"></i>';

        const corpo = document.createElement('div');
        const conteudo = document.createElement('div');
        conteudo.className = 'message-content';
        conteudo.style.whiteSpace = 'pre-line';
        conteudo.textContent = texto;
        corpo.appendChild(conteudo);

        if (crise) {
            corpo.appendChild(this.criarLinksDeAjuda());
        }

        const hora = document.createElement('div');
        hora.className = 'message-time';
        hora.textContent = new Date(dataIso || Date.now())
            .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        corpo.appendChild(hora);

        msg.append(avatar, corpo);
        // mantém o "digitando..." sempre por último
        this.mensagensEl.insertBefore(msg, this.typingEl);
        this.rolarParaBaixo();
    }

    criarLinksDeAjuda() {
        const box = document.createElement('div');
        box.className = 'chat-helpful-links';
        box.innerHTML = `
            <div class="helpful-links-title"><i class="fas fa-hands-helping"></i> Ajuda agora</div>
            <a class="helpful-link" href="tel:188"><i class="fas fa-phone"></i> CVV - ligar 188 (24h, gratuito)</a>
            <a class="helpful-link" href="https://cvv.org.br" target="_blank" rel="noopener"><i class="fas fa-comments"></i> Chat do CVV (cvv.org.br)</a>
            <a class="helpful-link" href="tel:192"><i class="fas fa-ambulance"></i> SAMU - ligar 192</a>
        `;
        return box;
    }

    setEnviando(ativo) {
        this.enviando = ativo;
        this.typingEl.classList.toggle('visible', ativo);
        this.atualizarBotao();
        if (ativo) this.rolarParaBaixo();
    }

    atualizarBotao() {
        this.enviarBtn.disabled = this.enviando || !this.inputEl.value.trim();
    }

    ajustarAltura() {
        this.inputEl.style.height = 'auto';
        this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 120) + 'px';
    }

    rolarParaBaixo() {
        this.mensagensEl.scrollTop = this.mensagensEl.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});
