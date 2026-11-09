/**
 * Pluma - Histórico de Humor
 * Visualização de dados com Chart.js
 */

class HistoricoManager {
    constructor() {
        this.chart = null;
        this.currentPeriod = 'semana';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHistorico();
        this.renderChart();
        this.renderInsights();
    }

    setupEventListeners() {
        // Filtros de período
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.renderChart();
                this.renderInsights();
            });
        });

        // Tipo de visualização
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderChart(e.target.dataset.view);
            });
        });
    }

    loadHistorico() {
        const registros = JSON.parse(localStorage.getItem('pluma_humor_registros') || '[]');
        return registros.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    getFilteredData() {
        const registros = this.loadHistorico();
        const hoje = new Date();
        let dataInicio;

        switch (this.currentPeriod) {
            case 'semana':
                dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'mes':
                dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'ano':
                dataInicio = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return registros.filter(r => new Date(r.data) >= dataInicio);
    }

    getMoodValue(humor) {
        const valores = {
            'muito-feliz': 5,
            'feliz': 4,
            'neutro': 3,
            'triste': 2,
            'muito-triste': 1
        };
        return valores[humor] || 3;
    }

    getMoodColor(humor) {
        const cores = {
            'muito-feliz': '#10B981',
            'feliz': '#34D399',
            'neutro': '#F59E0B',
            'triste': '#F97316',
            'muito-triste': '#EF4444'
        };
        return cores[humor] || '#94A3B8';
    }

    getMoodEmoji(humor) {
        const emojis = {
            'muito-feliz': '😄',
            'feliz': '🙂',
            'neutro': '😐',
            'triste': '😢',
            'muito-triste': '😭'
        };
        return emojis[humor] || '😐';
    }

    renderChart(type = 'line') {
        const ctx = document.getElementById('humorChart');
        if (!ctx) return;

        const dados = this.getFilteredData();
        
        if (this.chart) {
            this.chart.destroy();
        }

        if (dados.length === 0) {
            this.showEmptyState();
            return;
        }

        const labels = dados.map(r => {
            const data = new Date(r.data);
            return data.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
        }).reverse();

        const values = dados.map(r => this.getMoodValue(r.humor)).reverse();
        const colors = dados.map(r => this.getMoodColor(r.humor)).reverse();

        const chartConfig = {
            type: type === 'bar' ? 'bar' : 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nível de Humor',
                    data: values,
                    borderColor: '#8B5CF6',
                    backgroundColor: type === 'bar' ? colors : 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: type !== 'bar',
                    tension: 0.4,
                    pointBackgroundColor: colors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: (context) => {
                                const registro = dados.reverse()[context.dataIndex];
                                const emoji = this.getMoodEmoji(registro.humor);
                                return `${emoji} ${registro.humor.replace('-', ' ')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 6,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => {
                                const labels = ['', '😭', '😢', '😐', '🙂', '😄', ''];
                                return labels[value] || '';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };

        this.chart = new Chart(ctx, chartConfig);
    }

    showEmptyState() {
        const container = document.querySelector('.chart-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Sem dados ainda</h3>
                    <p>Comece a registrar seu humor para ver as estatísticas aqui.</p>
                    <a href="humor.html" class="btn-primary">Registrar Humor</a>
                </div>
            `;
        }
    }

    renderInsights() {
        const dados = this.getFilteredData();
        const insightsContainer = document.getElementById('insights');
        
        if (!insightsContainer || dados.length === 0) {
            if (insightsContainer) {
                insightsContainer.innerHTML = `
                    <div class="insight-card">
                        <p>Registre seu humor por alguns dias para receber insights personalizados.</p>
                    </div>
                `;
            }
            return;
        }

        // Calcular estatísticas
        const total = dados.length;
        const media = dados.reduce((acc, r) => acc + this.getMoodValue(r.humor), 0) / total;
        
        // Humor mais frequente
        const frequencia = {};
        dados.forEach(r => {
            frequencia[r.humor] = (frequencia[r.humor] || 0) + 1;
        });
        const humorFrequente = Object.entries(frequencia).sort((a, b) => b[1] - a[1])[0];

        // Tendência
        const primeiraMeta = dados.slice(Math.floor(total / 2));
        const segundaMetade = dados.slice(0, Math.floor(total / 2));
        const mediaPrimeira = primeiraMeta.reduce((acc, r) => acc + this.getMoodValue(r.humor), 0) / (primeiraMeta.length || 1);
        const mediaSegunda = segundaMetade.reduce((acc, r) => acc + this.getMoodValue(r.humor), 0) / (segundaMetade.length || 1);
        const tendencia = mediaSegunda - mediaPrimeira;

        // Dias consecutivos positivos
        let diasPositivos = 0;
        for (const r of dados) {
            if (this.getMoodValue(r.humor) >= 4) {
                diasPositivos++;
            } else {
                break;
            }
        }

        insightsContainer.innerHTML = `
            <div class="insight-card">
                <div class="insight-icon">📈</div>
                <div class="insight-content">
                    <h4>Média de Humor</h4>
                    <p class="insight-value">${media.toFixed(1)} / 5</p>
                    <p class="insight-desc">${this.getMediaDescription(media)}</p>
                </div>
            </div>
            
            <div class="insight-card">
                <div class="insight-icon">${this.getMoodEmoji(humorFrequente[0])}</div>
                <div class="insight-content">
                    <h4>Humor Mais Frequente</h4>
                    <p class="insight-value">${humorFrequente[0].replace('-', ' ')}</p>
                    <p class="insight-desc">${humorFrequente[1]} de ${total} registros</p>
                </div>
            </div>
            
            <div class="insight-card">
                <div class="insight-icon">${tendencia > 0 ? '📈' : tendencia < 0 ? '📉' : '➡️'}</div>
                <div class="insight-content">
                    <h4>Tendência</h4>
                    <p class="insight-value">${this.getTendenciaText(tendencia)}</p>
                    <p class="insight-desc">${this.getTendenciaDesc(tendencia)}</p>
                </div>
            </div>
            
            <div class="insight-card">
                <div class="insight-icon">🔥</div>
                <div class="insight-content">
                    <h4>Sequência Positiva</h4>
                    <p class="insight-value">${diasPositivos} dias</p>
                    <p class="insight-desc">${diasPositivos > 0 ? 'Continue assim!' : 'Vamos melhorar juntos'}</p>
                </div>
            </div>
        `;
    }

    getMediaDescription(media) {
        if (media >= 4.5) return 'Excelente! Você está radiante!';
        if (media >= 3.5) return 'Muito bom! Continue cuidando de você.';
        if (media >= 2.5) return 'Neutro. Que tal algumas atividades relaxantes?';
        if (media >= 1.5) return 'Momento difícil. Estamos aqui por você.';
        return 'Procure apoio. Você não está sozinho.';
    }

    getTendenciaText(tendencia) {
        if (tendencia > 0.5) return 'Melhorando';
        if (tendencia < -0.5) return 'Em queda';
        return 'Estável';
    }

    getTendenciaDesc(tendencia) {
        if (tendencia > 0.5) return 'Seu humor está melhorando!';
        if (tendencia < -0.5) return 'Vamos trabalhar nisso juntos.';
        return 'Mantendo a constância.';
    }
}

// Lista de registros
class RegistrosLista {
    constructor() {
        this.init();
    }

    init() {
        this.renderLista();
    }

    renderLista() {
        const container = document.getElementById('registros-lista');
        if (!container) return;

        const registros = JSON.parse(localStorage.getItem('pluma_humor_registros') || '[]');
        
        if (registros.length === 0) {
            container.innerHTML = `
                <div class="empty-list">
                    <p>Nenhum registro encontrado.</p>
                </div>
            `;
            return;
        }

        const registrosOrdenados = registros.sort((a, b) => new Date(b.data) - new Date(a.data));

        container.innerHTML = registrosOrdenados.map(r => {
            const data = new Date(r.data);
            const dataFormatada = data.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

            const emojis = {
                'muito-feliz': '😄',
                'feliz': '🙂',
                'neutro': '😐',
                'triste': '😢',
                'muito-triste': '😭'
            };

            return `
                <div class="registro-item" data-id="${r.id}">
                    <div class="registro-emoji">${emojis[r.humor] || '😐'}</div>
                    <div class="registro-info">
                        <span class="registro-data">${dataFormatada}</span>
                        <span class="registro-humor">${r.humor.replace('-', ' ')}</span>
                        ${r.nota ? `<p class="registro-nota">${r.nota}</p>` : ''}
                        ${r.fatores && r.fatores.length > 0 ? `
                            <div class="registro-fatores">
                                ${r.fatores.map(f => `<span class="fator-tag">${f}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <button class="btn-delete" onclick="deletarRegistro('${r.id}')" aria-label="Deletar registro">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
    }
}

function deletarRegistro(id) {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
        const registros = JSON.parse(localStorage.getItem('pluma_humor_registros') || '[]');
        const novosRegistros = registros.filter(r => r.id !== id);
        localStorage.setItem('pluma_humor_registros', JSON.stringify(novosRegistros));
        location.reload();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new HistoricoManager();
    new RegistrosLista();
});
