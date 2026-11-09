/**
 * Pluma - Configurações
 * Gerenciamento de preferências do usuário
 */

class ConfigManager {
    constructor() {
        this.config = this.carregarConfig();
        this.init();
    }

    carregarConfig() {
        const configPadrao = {
            nome: '',
            tema: 'claro',
            notificacoes: true,
            lembreteHumor: true,
            horarioLembrete: '20:00',
            som: true,
            animacoes: true,
            fonteGrande: false
        };

        const configSalva = localStorage.getItem('pluma_config');
        return configSalva ? { ...configPadrao, ...JSON.parse(configSalva) } : configPadrao;
    }

    salvarConfig() {
        localStorage.setItem('pluma_config', JSON.stringify(this.config));
        this.aplicarConfig();
    }

    aplicarConfig() {
        // Tema
        document.documentElement.setAttribute('data-theme', this.config.tema);
        
        // Fonte grande
        document.body.classList.toggle('fonte-grande', this.config.fonteGrande);
        
        // Animações
        document.body.classList.toggle('sem-animacoes', !this.config.animacoes);
    }

    init() {
        this.aplicarConfig();
        this.setupEventListeners();
        this.preencherFormulario();
    }

    setupEventListeners() {
        // Nome
        const inputNome = document.getElementById('config-nome');
        if (inputNome) {
            inputNome.addEventListener('change', (e) => {
                this.config.nome = e.target.value;
                localStorage.setItem('pluma_user_name', e.target.value);
                this.salvarConfig();
            });
        }

        // Tema
        document.querySelectorAll('input[name="tema"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.config.tema = e.target.value;
                this.salvarConfig();
            });
        });

        // Toggles
        const toggles = ['notificacoes', 'lembreteHumor', 'som', 'animacoes', 'fonteGrande'];
        toggles.forEach(toggle => {
            const el = document.getElementById(`config-${toggle}`);
            if (el) {
                el.addEventListener('change', (e) => {
                    this.config[toggle] = e.target.checked;
                    this.salvarConfig();
                });
            }
        });

        // Horário lembrete
        const inputHorario = document.getElementById('config-horarioLembrete');
        if (inputHorario) {
            inputHorario.addEventListener('change', (e) => {
                this.config.horarioLembrete = e.target.value;
                this.salvarConfig();
            });
        }

        // Botão limpar dados
        const btnLimpar = document.getElementById('btn-limpar-dados');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => this.limparDados());
        }

        // Botão exportar dados
        const btnExportar = document.getElementById('btn-exportar-dados');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.exportarDados());
        }

        // Botão importar dados
        const btnImportar = document.getElementById('btn-importar-dados');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
        }

        const inputImport = document.getElementById('import-file');
        if (inputImport) {
            inputImport.addEventListener('change', (e) => this.importarDados(e));
        }
    }

    preencherFormulario() {
        // Nome
        const inputNome = document.getElementById('config-nome');
        if (inputNome) {
            inputNome.value = this.config.nome || localStorage.getItem('pluma_user_name') || '';
        }

        // Tema
        const radioTema = document.querySelector(`input[name="tema"][value="${this.config.tema}"]`);
        if (radioTema) {
            radioTema.checked = true;
        }

        // Toggles
        const toggles = ['notificacoes', 'lembreteHumor', 'som', 'animacoes', 'fonteGrande'];
        toggles.forEach(toggle => {
            const el = document.getElementById(`config-${toggle}`);
            if (el) {
                el.checked = this.config[toggle];
            }
        });

        // Horário
        const inputHorario = document.getElementById('config-horarioLembrete');
        if (inputHorario) {
            inputHorario.value = this.config.horarioLembrete;
        }

        // Estatísticas
        this.atualizarEstatisticas();
    }

    atualizarEstatisticas() {
        // Total de registros de humor
        const registrosHumor = JSON.parse(localStorage.getItem('pluma_humor_registros') || '[]');
        const totalHumor = document.getElementById('stat-humor');
        if (totalHumor) {
            totalHumor.textContent = registrosHumor.length;
        }

        // Total de entradas do diário
        const entradasDiario = JSON.parse(localStorage.getItem('pluma_diario_entradas') || '[]');
        const totalDiario = document.getElementById('stat-diario');
        if (totalDiario) {
            totalDiario.textContent = entradasDiario.length;
        }

        // Sessões de respiração
        const sessoesRespiracao = JSON.parse(localStorage.getItem('pluma_respiracao_sessoes') || '[]');
        const totalRespiracao = document.getElementById('stat-respiracao');
        if (totalRespiracao) {
            totalRespiracao.textContent = sessoesRespiracao.length;
        }

        // Dias consecutivos
        const diasConsecutivos = this.calcularDiasConsecutivos();
        const statConsecutivos = document.getElementById('stat-consecutivos');
        if (statConsecutivos) {
            statConsecutivos.textContent = diasConsecutivos;
        }
    }

    calcularDiasConsecutivos() {
        const registros = JSON.parse(localStorage.getItem('pluma_humor_registros') || '[]');
        if (registros.length === 0) return 0;

        const datas = registros
            .map(r => new Date(r.data).toDateString())
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort((a, b) => new Date(b) - new Date(a));

        let consecutivos = 1;
        const hoje = new Date().toDateString();
        
        if (datas[0] !== hoje) {
            const ontem = new Date(Date.now() - 86400000).toDateString();
            if (datas[0] !== ontem) return 0;
        }

        for (let i = 1; i < datas.length; i++) {
            const dataAtual = new Date(datas[i - 1]);
            const dataAnterior = new Date(datas[i]);
            const diff = (dataAtual - dataAnterior) / 86400000;
            
            if (diff === 1) {
                consecutivos++;
            } else {
                break;
            }
        }

        return consecutivos;
    }

    limparDados() {
        if (confirm('Tem certeza que deseja apagar TODOS os seus dados? Esta ação não pode ser desfeita.')) {
            if (confirm('Esta é sua última chance. Todos os registros, entradas do diário e configurações serão perdidos. Continuar?')) {
                // Lista de chaves do localStorage para limpar
                const chaves = [
                    'pluma_config',
                    'pluma_user_name',
                    'pluma_user_logged',
                    'pluma_humor_registros',
                    'pluma_diario_entradas',
                    'pluma_respiracao_sessoes',
                    'pluma_chat_historico'
                ];

                chaves.forEach(chave => localStorage.removeItem(chave));

                alert('Todos os dados foram apagados.');
                window.location.href = 'login.html';
            }
        }
    }

    exportarDados() {
        const dados = {
            versao: '1.0',
            dataExportacao: new Date().toISOString(),
            config: this.config,
            nome: localStorage.getItem('pluma_user_name'),
            humorRegistros: JSON.parse(localStorage.getItem('pluma_humor_registros') || '[]'),
            diarioEntradas: JSON.parse(localStorage.getItem('pluma_diario_entradas') || '[]'),
            respiracaoSessoes: JSON.parse(localStorage.getItem('pluma_respiracao_sessoes') || '[]'),
            chatHistorico: JSON.parse(localStorage.getItem('pluma_chat_historico') || '[]')
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pluma-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Dados exportados com sucesso!');
    }

    importarDados(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);

                if (!dados.versao) {
                    throw new Error('Arquivo inválido');
                }

                if (confirm('Isso irá substituir todos os seus dados atuais. Continuar?')) {
                    // Restaurar dados
                    if (dados.config) {
                        localStorage.setItem('pluma_config', JSON.stringify(dados.config));
                    }
                    if (dados.nome) {
                        localStorage.setItem('pluma_user_name', dados.nome);
                    }
                    if (dados.humorRegistros) {
                        localStorage.setItem('pluma_humor_registros', JSON.stringify(dados.humorRegistros));
                    }
                    if (dados.diarioEntradas) {
                        localStorage.setItem('pluma_diario_entradas', JSON.stringify(dados.diarioEntradas));
                    }
                    if (dados.respiracaoSessoes) {
                        localStorage.setItem('pluma_respiracao_sessoes', JSON.stringify(dados.respiracaoSessoes));
                    }
                    if (dados.chatHistorico) {
                        localStorage.setItem('pluma_chat_historico', JSON.stringify(dados.chatHistorico));
                    }

                    alert('Dados importados com sucesso!');
                    location.reload();
                }
            } catch (error) {
                alert('Erro ao importar dados. Verifique se o arquivo é válido.');
                console.error('Erro na importação:', error);
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    }
}

// Acessibilidade
class AcessibilidadeManager {
    constructor() {
        this.init();
    }

    init() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Alt + T = Toggle tema
            if (e.altKey && e.key === 't') {
                this.toggleTema();
            }
            // Alt + H = Ir para home
            if (e.altKey && e.key === 'h') {
                window.location.href = 'index.html';
            }
            // Escape = Fechar modais
            if (e.key === 'Escape') {
                this.fecharModais();
            }
        });
    }

    toggleTema() {
        const temaAtual = document.documentElement.getAttribute('data-theme');
        const novoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';
        document.documentElement.setAttribute('data-theme', novoTema);
        
        const config = JSON.parse(localStorage.getItem('pluma_config') || '{}');
        config.tema = novoTema;
        localStorage.setItem('pluma_config', JSON.stringify(config));
    }

    fecharModais() {
        document.querySelectorAll('.modal.visible').forEach(modal => {
            modal.classList.remove('visible');
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new ConfigManager();
    new AcessibilidadeManager();
});
