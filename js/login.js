/**
 * PLUMA - Login Social
 * Gerenciamento de autenticação com Google e Apple (simulado via LocalStorage)
 */

document.addEventListener('DOMContentLoaded', function() {
    initLogin();
});

function initLogin() {
    // Se o usuário já estiver logado, redireciona para a home
    if (localStorage.getItem('pluma_logged_in') === 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Configura os botões de login social
    setupSocialLogin();
}

// ============================================
// LOGIN SOCIAL (GOOGLE E APPLE)
// ============================================

function setupSocialLogin() {
    const googleBtn = document.getElementById('googleLogin');
    const appleBtn = document.getElementById('appleLogin');

    if (googleBtn) {
        googleBtn.addEventListener('click', function(e) {
            simulateSocialLogin('Google', e.currentTarget);
        });
    }
    
    if (appleBtn) {
        appleBtn.addEventListener('click', function(e) {
            simulateSocialLogin('Apple', e.currentTarget);
        });
    }
}

function simulateSocialLogin(provider, button) {
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
    }
    
    setTimeout(() => {
        // Cria os dados simulados do usuário logado
        const fakeEmail = `usuario_${provider.toLowerCase()}@exemplo.com`;
        
        const user = {
            id: Date.now(),
            email: fakeEmail,
            name: `Usuário ${provider}`,
            provider: provider,
            createdAt: new Date().toISOString()
        };
        
        // Salva os dados e marca como logado no localStorage
        localStorage.setItem('pluma_user', JSON.stringify(user));
        localStorage.setItem('pluma_user_name', user.name);
        localStorage.setItem('pluma_logged_in', 'true');
        
        // Redireciona para a página principal
        window.location.href = 'index.html';
    }, 1200);
}