/**
 * Pluma - Gerenciamento de Armazenamento
 * Utilitários para localStorage
 */

const PlumaStorage = {
    // Prefixo para todas as chaves
    PREFIX: 'pluma_',

    // Obter item com parse automático
    get(key) {
        try {
            const item = localStorage.getItem(this.PREFIX + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Erro ao ler do localStorage:', e);
            return null;
        }
    },

    // Salvar item com stringify automático
    set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            return false;
        }
    },

    // Remover item
    remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    },

    // Verificar se existe
    has(key) {
        return localStorage.getItem(this.PREFIX + key) !== null;
    },

    // Obter tamanho usado
    getUsedSpace() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.PREFIX)) {
                total += localStorage.getItem(key).length * 2; // UTF-16
            }
        }
        return total;
    },

    // Formatar bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Registro de Humor
const HumorStorage = {
    KEY: 'humor_registros',

    getAll() {
        return PlumaStorage.get(this.KEY) || [];
    },

    add(registro) {
        const registros = this.getAll();
        registro.id = Date.now().toString();
        registro.data = new Date().toISOString();
        registros.push(registro);
        PlumaStorage.set(this.KEY, registros);
        return registro;
    },

    delete(id) {
        const registros = this.getAll().filter(r => r.id !== id);
        PlumaStorage.set(this.KEY, registros);
    },

    getByDate(date) {
        const dataStr = new Date(date).toDateString();
        return this.getAll().filter(r => new Date(r.data).toDateString() === dataStr);
    },

    getRecent(days = 7) {
        const dataLimite = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.getAll().filter(r => new Date(r.data) >= dataLimite);
    }
};

// Diário
const DiarioStorage = {
    KEY: 'diario_entradas',

    getAll() {
        return PlumaStorage.get(this.KEY) || [];
    },

    add(entrada) {
        const entradas = this.getAll();
        entrada.id = Date.now().toString();
        entrada.criadoEm = new Date().toISOString();
        entrada.atualizadoEm = entrada.criadoEm;
        entradas.push(entrada);
        PlumaStorage.set(this.KEY, entradas);
        return entrada;
    },

    update(id, dados) {
        const entradas = this.getAll();
        const index = entradas.findIndex(e => e.id === id);
        if (index !== -1) {
            entradas[index] = { 
                ...entradas[index], 
                ...dados, 
                atualizadoEm: new Date().toISOString() 
            };
            PlumaStorage.set(this.KEY, entradas);
            return entradas[index];
        }
        return null;
    },

    delete(id) {
        const entradas = this.getAll().filter(e => e.id !== id);
        PlumaStorage.set(this.KEY, entradas);
    },

    search(termo) {
        const termoLower = termo.toLowerCase();
        return this.getAll().filter(e => 
            e.titulo?.toLowerCase().includes(termoLower) ||
            e.conteudo?.toLowerCase().includes(termoLower)
        );
    }
};

// Sessões de Respiração
const RespiracaoStorage = {
    KEY: 'respiracao_sessoes',

    getAll() {
        return PlumaStorage.get(this.KEY) || [];
    },

    add(sessao) {
        const sessoes = this.getAll();
        sessao.id = Date.now().toString();
        sessao.data = new Date().toISOString();
        sessoes.push(sessao);
        PlumaStorage.set(this.KEY, sessoes);
        return sessao;
    },

    getStats() {
        const sessoes = this.getAll();
        return {
            total: sessoes.length,
            ultimaSemana: sessoes.filter(s => 
                new Date(s.data) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            tecnicaFavorita: this.getTecnicaFavorita()
        };
    },

    getTecnicaFavorita() {
        const sessoes = this.getAll();
        const contagem = {};
        sessoes.forEach(s => {
            contagem[s.tecnica] = (contagem[s.tecnica] || 0) + 1;
        });
        const ordenado = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
        return ordenado[0] ? ordenado[0][0] : null;
    }
};

// Chat
const ChatStorage = {
    KEY: 'chat_historico',

    getAll() {
        return PlumaStorage.get(this.KEY) || [];
    },

    add(mensagem) {
        const mensagens = this.getAll();
        mensagem.id = Date.now().toString();
        mensagem.timestamp = new Date().toISOString();
        mensagens.push(mensagem);
        PlumaStorage.set(this.KEY, mensagens);
        return mensagem;
    },

    clear() {
        PlumaStorage.remove(this.KEY);
    }
};

// Configurações do Usuário
const ConfigStorage = {
    KEY: 'config',

    defaults: {
        nome: '',
        tema: 'claro',
        notificacoes: true,
        lembreteHumor: true,
        horarioLembrete: '20:00',
        som: true,
        animacoes: true,
        fonteGrande: false
    },

    get() {
        const saved = PlumaStorage.get(this.KEY);
        return { ...this.defaults, ...saved };
    },

    set(config) {
        PlumaStorage.set(this.KEY, config);
    },

    update(key, value) {
        const config = this.get();
        config[key] = value;
        this.set(config);
    },

    reset() {
        PlumaStorage.set(this.KEY, this.defaults);
    }
};

// Exportar para uso global
window.PlumaStorage = PlumaStorage;
window.HumorStorage = HumorStorage;
window.DiarioStorage = DiarioStorage;
window.RespiracaoStorage = RespiracaoStorage;
window.ChatStorage = ChatStorage;
window.ConfigStorage = ConfigStorage;
