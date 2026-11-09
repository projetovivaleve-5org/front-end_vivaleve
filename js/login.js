/**
 * PLUMA - Login
 * Gerenciamento de autenticação (simulado com LocalStorage)
 */

document.addEventListener('DOMContentLoaded', function() {
    initLogin();
});

function initLogin() {
    // Verifica se já está logado
    if (localStorage.getItem('pluma_logged_in') === 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Configura formulário
    setupLoginForm();
    
    // Configura toggle de senha
    setupPasswordToggle();
    
    // Configura links
    setupLinks();
    
    // Configura login social
    setupSocialLogin();
}

// ============================================
// FORMULÁRIO DE LOGIN
// ============================================

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    
    // Validação em tempo real
    emailInput.addEventListener('input', function() {
        validateEmail(this);
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword(this);
    });
    
    // Submit do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Valida campos
        const isEmailValid = validateEmail(emailInput);
        const isPasswordValid = validatePassword(passwordInput);
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        // Simula login
        performLogin(emailInput.value, passwordInput.value);
    });
}

function validateEmail(input) {
    const email = input.value.trim();
    const errorElement = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        input.classList.add('error');
        errorElement.classList.add('visible');
        return false;
    } else {
        input.classList.remove('error');
        errorElement.classList.remove('visible');
        return true;
    }
}

function validatePassword(input) {
    const password = input.value;
    const errorElement = document.getElementById('passwordError');
    
    if (!password || password.length < 6) {
        input.classList.add('error');
        errorElement.classList.add('visible');
        return false;
    } else {
        input.classList.remove('error');
        errorElement.classList.remove('visible');
        return true;
    }
}

function performLogin(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Adiciona estado de loading
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Simula delay de autenticação
    setTimeout(() => {
        // Verifica se existe usuário cadastrado
        const existingUsers = JSON.parse(localStorage.getItem('pluma_users') || '[]');
        const user = existingUsers.find(u => u.email === email);
        
        if (user && user.password === password) {
            // Login com usuário existente
            loginSuccess(user, rememberMe);
        } else if (!user) {
            // Cria novo usuário (para demonstração)
            const newUser = {
                id: Date.now(),
                email: email,
                password: password,
                name: email.split('@')[0],
                createdAt: new Date().toISOString()
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('pluma_users', JSON.stringify(existingUsers));
            
            loginSuccess(newUser, rememberMe);
        } else {
            // Senha incorreta
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            
            const passwordInput = document.getElementById('password');
            passwordInput.classList.add('error');
            document.getElementById('passwordError').textContent = 'Senha incorreta';
            document.getElementById('passwordError').classList.add('visible');
        }
    }, 1500);
}

function loginSuccess(user, rememberMe) {
    // Salva dados do usuário
    localStorage.setItem('pluma_user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
    }));
    
    localStorage.setItem('pluma_logged_in', 'true');
    
    if (rememberMe) {
        localStorage.setItem('pluma_remember', user.email);
    } else {
        localStorage.removeItem('pluma_remember');
    }
    
    // Redireciona para home
    window.location.href = 'index.html';
}

// ============================================
// TOGGLE DE SENHA
// ============================================

function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
}

// ============================================
// LINKS
// ============================================

function setupLinks() {
    // Esqueceu a senha
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        
        if (email) {
            alert(`Um email de recuperação seria enviado para: ${email}\n\n(Esta é uma demonstração, nenhum email foi enviado)`);
        } else {
            alert('Por favor, insira seu email primeiro.');
            document.getElementById('email').focus();
        }
    });
    
    // Cadastrar
    document.getElementById('registerLink').addEventListener('click', function(e) {
        e.preventDefault();
        alert('O cadastro é feito automaticamente ao fazer login com um novo email.\n\nInsira seu email e uma senha de pelo menos 6 caracteres.');
        document.getElementById('email').focus();
    });
}

// ============================================
// LOGIN SOCIAL
// ============================================

function setupSocialLogin() {
    // Google
    document.getElementById('googleLogin').addEventListener('click', function() {
        simulateSocialLogin('Google');
    });
    
    // Apple
    document.getElementById('appleLogin').addEventListener('click', function() {
        simulateSocialLogin('Apple');
    });
}

function simulateSocialLogin(provider) {
    const btn = event.target.closest('.social-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
    
    setTimeout(() => {
        // Simula login social
        const fakeEmail = `usuario_${provider.toLowerCase()}@exemplo.com`;
        
        const user = {
            id: Date.now(),
            email: fakeEmail,
            name: `Usuário ${provider}`,
            provider: provider,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('pluma_user', JSON.stringify(user));
        localStorage.setItem('pluma_logged_in', 'true');
        
        window.location.href = 'index.html';
    }, 2000);
}

// ============================================
// CARREGAR EMAIL SALVO
// ============================================

(function loadRememberedEmail() {
    const remembered = localStorage.getItem('pluma_remember');
    if (remembered) {
        const emailInput = document.getElementById('email');
        const rememberMe = document.getElementById('rememberMe');
        
        if (emailInput) emailInput.value = remembered;
        if (rememberMe) rememberMe.checked = true;
    }
})();
