/**
 * PLUMA - Aplicação Principal
 * Funções globais e utilitárias
 */

// ============================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================

const STORAGE_KEYS = {
    USER: 'pluma_user',
    LOGGED_IN: 'pluma_logged_in',
    MOODS: 'pluma_moods',
    DIARY: 'pluma_diary',
    BREATHING: 'pluma_breathing',
    THEME: 'pluma_theme',
    NOTIFICATIONS: 'pluma_notifications',
    SOUNDS: 'pluma_sounds'
};

const EMOTIONS = {
    'otimo': { icon: '😄', label: 'Ótimo', color: '#4CAF50', value: 5 },
    'bem': { icon: '🙂', label: 'Bem', color: '#8BC34A', value: 4 },
    'mais-ou-menos': { icon: '😐', label: 'Mais ou menos', color: '#FFC107', value: 3 },
    'mal': { icon: '😔', label: 'Mal', color: '#FF9800', value: 2 },
    'depressivo': { icon: '😢', label: 'Depressivo', color: '#9C27B0', value: 1 },
    'ansioso': { icon: '😰', label: 'Ansioso', color: '#E91E63', value: 1 }
};

const MOTIVATIONAL_QUOTES = [
    { text: "Cada dia é uma nova oportunidade para cuidar de si mesmo.", author: "Pluma" },
    { text: "Você é mais forte do que imagina.", author: "Pluma" },
    { text: "Não há problema em não estar bem. O importante é buscar ajuda.", author: "Pluma" },
    { text: "A jornada de mil milhas começa com um único passo.", author: "Lao Tzu" },
    { text: "Cuide da sua mente, ela é seu bem mais precioso.", author: "Pluma" },
    { text: "Respirar fundo é o primeiro passo para a calma.", author: "Pluma" },
    { text: "Você merece paz e tranquilidade.", author: "Pluma" },
    { text: "Um dia de cada vez. Você está fazendo o seu melhor.", author: "Pluma" },
    { text: "Aceite-se como você é. Você é único e especial.", author: "Pluma" },
    { text: "A tempestade passa, e o sol sempre volta a brilhar.", author: "Pluma" },
    { text: "Permita-se sentir. Suas emoções são válidas.", author: "Pluma" },
    { text: "Pequenos progressos ainda são progressos.", author: "Pluma" }
];

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Esconde splash screen após carregamento
    hideSplashScreen();
    
    // Carrega tema salvo
    loadTheme();
    
    // Configura saudação personalizada
    setGreeting();
    
    // Carrega frase motivacional
    loadMotivationalQuote();
    
    // Configura toggle de tema
    setupThemeToggle();
}

// ============================================
// SPLASH SCREEN
// ============================================

function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }, 1500);
    }
}

// ============================================
// TEMA (DARK MODE)
// ============================================

function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    
    // Verifica preferência do sistema se não houver tema salvo
    if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    
    // Atualiza ícone do botão
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Atualiza ícone inicial
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============================================
// SAUDAÇÃO PERSONALIZADA
// ============================================

function setGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const name = user.name ? `, ${user.name}` : '';
    
    let greeting;
    if (hour >= 5 && hour < 12) {
        greeting = `Bom dia${name}! ☀️`;
    } else if (hour >= 12 && hour < 18) {
        greeting = `Boa tarde${name}! 🌤️`;
    } else {
        greeting = `Boa noite${name}! 🌙`;
    }
    
    greetingElement.textContent = greeting;
}

// ============================================
// FRASES MOTIVACIONAIS
// ============================================

function loadMotivationalQuote() {
    const quoteElement = document.getElementById('motivationalQuote');
    const authorElement = document.getElementById('motivationalAuthor');
    
    if (!quoteElement || !authorElement) return;
    
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    
    quoteElement.textContent = `"${randomQuote.text}"`;
    authorElement.textContent = `— ${randomQuote.author}`;
}

// ============================================
// UTILITÁRIOS DE DATA
// ============================================

function formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = {
        short: { day: '2-digit', month: '2-digit' },
        medium: { day: '2-digit', month: 'short', year: 'numeric' },
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return d.toLocaleDateString('pt-BR', options[format]);
}

function formatDateTime(date) {
    const d = new Date(date);
    return `${formatDate(d, 'medium')} às ${formatDate(d, 'time')}`;
}

function getDayName(date) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date(date).getDay()];
}

function getMonthName(date) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[new Date(date).getMonth()];
}

function isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
}

function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const d = new Date(date);
    return d.toDateString() === yesterday.toDateString();
}

function getRelativeDate(date) {
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return formatDate(date, 'medium');
}

// ============================================
// UTILITÁRIOS DE STORAGE
// ============================================

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
        return false;
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Erro ao ler do localStorage:', e);
        return defaultValue;
    }
}

// ============================================
// UTILITÁRIOS DE HUMOR/EMOÇÕES
// ============================================

function getEmotionData(emotion) {
    return EMOTIONS[emotion] || { icon: '😶', label: 'Desconhecido', color: '#999', value: 0 };
}

function getMoods() {
    return getFromStorage(STORAGE_KEYS.MOODS, []);
}

function saveMood(moodData) {
    const moods = getMoods();
    moods.push({
        id: Date.now(),
        ...moodData,
        createdAt: new Date().toISOString()
    });
    return saveToStorage(STORAGE_KEYS.MOODS, moods);
}

// ============================================
// UTILITÁRIOS DE DIÁRIO
// ============================================

function getDiaryEntries() {
    return getFromStorage(STORAGE_KEYS.DIARY, []);
}

function saveDiaryEntry(entry) {
    const entries = getDiaryEntries();
    entries.unshift({
        id: Date.now(),
        ...entry,
        createdAt: new Date().toISOString()
    });
    return saveToStorage(STORAGE_KEYS.DIARY, entries);
}

function updateDiaryEntry(id, updatedEntry) {
    const entries = getDiaryEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
        entries[index] = { ...entries[index], ...updatedEntry, updatedAt: new Date().toISOString() };
        return saveToStorage(STORAGE_KEYS.DIARY, entries);
    }
    return false;
}

function deleteDiaryEntry(id) {
    const entries = getDiaryEntries();
    const filtered = entries.filter(e => e.id !== id);
    return saveToStorage(STORAGE_KEYS.DIARY, filtered);
}

// ============================================
// UTILITÁRIOS DE RESPIRAÇÃO
// ============================================

function getBreathingStats() {
    return getFromStorage(STORAGE_KEYS.BREATHING, {
        totalSessions: 0,
        totalMinutes: 0,
        todaySessions: 0,
        lastSessionDate: null
    });
}

function saveBreathingSession(durationMinutes) {
    const stats = getBreathingStats();
    const today = new Date().toDateString();
    
    // Reset contador diário se for novo dia
    if (stats.lastSessionDate !== today) {
        stats.todaySessions = 0;
    }
    
    stats.totalSessions++;
    stats.totalMinutes += durationMinutes;
    stats.todaySessions++;
    stats.lastSessionDate = today;
    
    return saveToStorage(STORAGE_KEYS.BREATHING, stats);
}

// ============================================
// CÁLCULOS DE ESTATÍSTICAS
// ============================================

function calculateStreak() {
    const moods = getMoods();
    if (moods.length === 0) return 0;
    
    // Ordena por data (mais recente primeiro)
    moods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Verifica se há registro hoje
    const latestMood = new Date(moods[0].createdAt);
    latestMood.setHours(0, 0, 0, 0);
    
    if (latestMood.getTime() !== currentDate.getTime()) {
        // Se não há registro hoje, verifica ontem
        const yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (latestMood.getTime() !== yesterday.getTime()) {
            return 0; // Sequência quebrada
        }
        currentDate = yesterday;
    }
    
    // Conta dias consecutivos
    const uniqueDates = [...new Set(moods.map(m => {
        const d = new Date(m.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }))].sort((a, b) => b - a);
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);
        
        if (uniqueDates[i] === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function getDominantEmotion() {
    const moods = getMoods();
    if (moods.length === 0) return null;
    
    const counts = {};
    moods.forEach(m => {
        counts[m.emotion] = (counts[m.emotion] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominant = null;
    
    Object.entries(counts).forEach(([emotion, count]) => {
        if (count > maxCount) {
            maxCount = count;
            dominant = emotion;
        }
    });
    
    return {
        emotion: dominant,
        count: maxCount,
        percentage: Math.round((maxCount / moods.length) * 100)
    };
}

function getEmotionDistribution() {
    const moods = getMoods();
    const total = moods.length;
    
    if (total === 0) return [];
    
    const counts = {};
    moods.forEach(m => {
        counts[m.emotion] = (counts[m.emotion] || 0) + 1;
    });
    
    return Object.entries(counts).map(([emotion, count]) => ({
        emotion,
        ...getEmotionData(emotion),
        count,
        percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
}

// ============================================
// UTILITÁRIOS GERAIS
// ============================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ACESSIBILIDADE
// ============================================

// Adiciona suporte a navegação por teclado para elementos clicáveis
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target.hasAttribute('tabindex') && target.getAttribute('role') === 'button') {
            e.preventDefault();
            target.click();
        }
    }
});

// Exporta funções para uso global
window.Pluma = {
    STORAGE_KEYS,
    EMOTIONS,
    MOTIVATIONAL_QUOTES,
    formatDate,
    formatDateTime,
    getDayName,
    getMonthName,
    isToday,
    isYesterday,
    getRelativeDate,
    saveToStorage,
    getFromStorage,
    getEmotionData,
    getMoods,
    saveMood,
    getDiaryEntries,
    saveDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    getBreathingStats,
    saveBreathingSession,
    calculateStreak,
    getDominantEmotion,
    getEmotionDistribution,
    generateId,
    debounce,
    escapeHtml
};
