/**
 * PLUMA - Registro de Humor
 * Permite ao usuário registrar seu estado emocional diário
 */

let selectedEmotion = null;
let selectedActivities = [];
let uploadedImage = null;

document.addEventListener('DOMContentLoaded', function() {
    initHumorPage();
});

function initHumorPage() {
    // Configura data atual
    setCurrentDate();
    
    // Configura grid de emoções
    setupEmotionsGrid();
    
    // Configura área de atividades
    setupActivities();
    
    // Configura upload de imagem
    setupImageUpload();
    
    // Configura contador de caracteres
    setupCharCounter();
    
    // Configura botão de salvar
    setupSaveButton();
    
    // Carrega histórico rápido
    loadQuickHistory();
}

// ============================================
// DATA ATUAL
// ============================================

function setCurrentDate() {
    const dateElement = document.querySelector('#currentDate span');
    if (dateElement) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const today = new Date().toLocaleDateString('pt-BR', options);
        dateElement.textContent = today.charAt(0).toUpperCase() + today.slice(1);
    }
}

// ============================================
// GRID DE EMOÇÕES
// ============================================

function setupEmotionsGrid() {
    const emotionsGrid = document.getElementById('emotionsGrid');
    const emotionCards = emotionsGrid.querySelectorAll('.emotion-card');
    
    emotionCards.forEach(card => {
        card.addEventListener('click', function() {
            selectEmotion(this);
        });
        
        // Suporte a teclado
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectEmotion(this);
            }
        });
    });
}

function selectEmotion(card) {
    const emotion = card.dataset.emotion;
    
    // Remove seleção anterior
    document.querySelectorAll('.emotion-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
    });
    
    // Adiciona seleção
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    
    selectedEmotion = emotion;
    
    // Habilita botão de salvar
    updateSaveButton();
    
    // Adiciona feedback visual
    card.style.transform = 'scale(1.05)';
    setTimeout(() => {
        card.style.transform = '';
    }, 200);
}

// ============================================
// ATIVIDADES
// ============================================

function setupActivities() {
    const activitiesGrid = document.getElementById('activitiesGrid');
    const activityTags = activitiesGrid.querySelectorAll('.activity-tag');
    
    activityTags.forEach(tag => {
        tag.addEventListener('click', function() {
            toggleActivity(this);
        });
    });
}

function toggleActivity(tag) {
    const activity = tag.dataset.activity;
    
    if (tag.classList.contains('selected')) {
        tag.classList.remove('selected');
        selectedActivities = selectedActivities.filter(a => a !== activity);
    } else {
        tag.classList.add('selected');
        selectedActivities.push(activity);
    }
}

// ============================================
// UPLOAD DE IMAGEM
// ============================================

function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageUpload');
    const preview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const removeBtn = document.getElementById('removeImage');
    
    // Click para upload
    uploadArea.addEventListener('click', () => imageInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });
    
    // Input change
    imageInput.addEventListener('change', function() {
        if (this.files[0]) {
            handleImageUpload(this.files[0]);
        }
    });
    
    // Remover imagem
    removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        removeImage();
    });
}

function handleImageUpload(file) {
    // Verifica tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result;
        
        const previewImage = document.getElementById('previewImage');
        const preview = document.getElementById('uploadPreview');
        const uploadArea = document.getElementById('uploadArea');
        
        previewImage.src = uploadedImage;
        preview.classList.add('visible');
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    uploadedImage = null;
    
    const preview = document.getElementById('uploadPreview');
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageUpload');
    
    preview.classList.remove('visible');
    uploadArea.style.display = '';
    imageInput.value = '';
}

// ============================================
// CONTADOR DE CARACTERES
// ============================================

function setupCharCounter() {
    const noteTextarea = document.getElementById('moodNote');
    const charCount = document.getElementById('noteCharCount');
    
    noteTextarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });
}

// ============================================
// BOTÃO DE SALVAR
// ============================================

function setupSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    
    saveBtn.addEventListener('click', saveMoodRecord);
}

function updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = !selectedEmotion;
}

function saveMoodRecord() {
    if (!selectedEmotion) return;
    
    const note = document.getElementById('moodNote').value.trim();
    
    const moodData = {
        emotion: selectedEmotion,
        note: note,
        activities: selectedActivities,
        image: uploadedImage
    };
    
    // Salva no storage
    const success = Pluma.saveMood(moodData);
    
    if (success) {
        showSaveConfirmation();
    } else {
        alert('Erro ao salvar. Tente novamente.');
    }
}

function showSaveConfirmation() {
    // Esconde formulário
    document.querySelector('.humor-question').style.display = 'none';
    document.getElementById('emotionsGrid').style.display = 'none';
    document.querySelectorAll('.card').forEach(c => c.style.display = 'none');
    document.querySelector('.save-section').style.display = 'none';
    
    // Mostra confirmação
    const confirmation = document.getElementById('saveConfirmation');
    confirmation.classList.add('visible');
    
    // Atualiza histórico rápido
    setTimeout(() => {
        loadQuickHistory();
    }, 500);
    
    // Reset após alguns segundos (opcional - pode deixar na tela de confirmação)
    setTimeout(() => {
        resetForm();
    }, 3000);
}

function resetForm() {
    // Reset variáveis
    selectedEmotion = null;
    selectedActivities = [];
    uploadedImage = null;
    
    // Reset UI
    document.querySelectorAll('.emotion-card').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
    });
    
    document.querySelectorAll('.activity-tag').forEach(t => {
        t.classList.remove('selected');
    });
    
    document.getElementById('moodNote').value = '';
    document.getElementById('noteCharCount').textContent = '0';
    
    removeImage();
    
    // Mostra formulário novamente
    document.querySelector('.humor-question').style.display = '';
    document.getElementById('emotionsGrid').style.display = '';
    document.querySelectorAll('.card').forEach(c => c.style.display = '');
    document.querySelector('.save-section').style.display = '';
    
    // Esconde confirmação
    document.getElementById('saveConfirmation').classList.remove('visible');
    
    // Desabilita botão
    updateSaveButton();
}

// ============================================
// HISTÓRICO RÁPIDO
// ============================================

function loadQuickHistory() {
    const container = document.getElementById('quickHistoryItems');
    const section = document.getElementById('quickHistory');
    
    const moods = Pluma.getMoods();
    
    if (moods.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = '';
    
    // Pega últimos 7 registros
    const recentMoods = moods.slice(-7).reverse();
    
    container.innerHTML = recentMoods.map(mood => {
        const emotionData = Pluma.getEmotionData(mood.emotion);
        const date = new Date(mood.createdAt);
        
        return `
            <div class="quick-history-item">
                <span class="emotion-icon">${emotionData.icon}</span>
                <span class="date">${date.getDate()}/${date.getMonth() + 1}</span>
            </div>
        `;
    }).join('');
}
