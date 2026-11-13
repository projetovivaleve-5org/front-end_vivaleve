/**
 * PLUMA - Login
 * - Email e senha: login/cadastro de verdade no back-end (recebe o token usado pelo chat com IA).
 * - Google e Apple: ainda simulados via localStorage (sem token: o chat pede para entrar com email).
 * Depende de js/api.js (window.VivaLeveAPI).
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

    // Os botões "Sair" só apagam pluma_logged_in/pluma_user: aqui apagamos também o token
    // antigo, para o próximo login (inclusive o simulado) não usar a conta de outra pessoa.
    VivaLeveAPI.auth.sair();

    setupEmailLogin();

    // Configura os botões de login social
    setupSocialLogin();
}

// ============================================
// LOGIN COM EMAIL E SENHA (back-end)
// ============================================

function setupEmailLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('loginName');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmit');
    const toggleMode = document.getElementById('toggleMode');
    const toggleText = document.getElementById('toggleText');
    const passwordToggle = document.getElementById('passwordToggle');

    let modoCadastro = false;

    function mostrarErro(msg) {
        errorEl.textContent = msg;
        errorEl.classList.toggle('visible', Boolean(msg));
    }

    toggleMode.addEventListener('click', function(e) {
        e.preventDefault();
        modoCadastro = !modoCadastro;
        nameGroup.hidden = !modoCadastro;
        submitBtn.textContent = modoCadastro ? 'Criar conta' : 'Entrar';
        toggleText.textContent = modoCadastro ? 'Já tem conta?' : 'Ainda não tem conta?';
        toggleMode.textContent = modoCadastro ? 'Entrar' : 'Criar conta';
        passwordInput.autocomplete = modoCadastro ? 'new-password' : 'current-password';
        mostrarErro('');
    });

    passwordToggle.addEventListener('click', function() {
        const visivel = passwordInput.type === 'text';
        passwordInput.type = visivel ? 'password' : 'text';
        passwordToggle.innerHTML = visivel ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        passwordToggle.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Esconder senha');
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        mostrarErro('');

        const email = emailInput.value.trim();
        const senha = passwordInput.value;
        const nome = nameInput.value.trim();

        if (!email || !emailInput.checkValidity()) {
            mostrarErro('Informe um email válido.');
            return;
        }
        if (!senha) {
            mostrarErro('Informe a senha.');
            return;
        }
        if (modoCadastro && (senha.length < 8 || senha.length > 64)) {
            mostrarErro('A senha deve ter entre 8 e 64 caracteres.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        try {
            if (modoCadastro) {
                await VivaLeveAPI.auth.register(email, senha, nome);
            } else {
                await VivaLeveAPI.auth.login(email, senha);
            }
            window.location.href = 'index.html';
        } catch (err) {
            mostrarErro(mensagemDeErro(err, modoCadastro));
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

function mensagemDeErro(err, modoCadastro) {
    if (err.offline) return 'Não foi possível conectar ao servidor. Tente de novo em instantes.';
    if (err.status === 401) return 'Email ou senha inválidos.';
    if (err.status === 409) return 'Este email já tem conta. Entre com ele ou use o Google.';
    if (err.status === 400) return err.message || 'Confira os dados digitados.';
    return modoCadastro ? 'Não foi possível criar a conta agora.' : 'Não foi possível entrar agora.';
}

// ============================================
// LOGIN SOCIAL (GOOGLE E APPLE) - SIMULADO
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
