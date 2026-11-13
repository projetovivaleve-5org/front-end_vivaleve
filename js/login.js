/**
 * PLUMA - Login
 * - Email e senha: /v1/auth/login e /v1/auth/register no back-end.
 * - Google: botão oficial do Google (Google Identity Services) -> ID Token -> /v1/auth/google.
 * Os dois devolvem o token usado pelo chat com IA.
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
    // antigo, para o próximo login não usar a conta de outra pessoa.
    VivaLeveAPI.auth.sair();

    setupEmailLogin();

    setupGoogleLogin();
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
// LOGIN COM GOOGLE (back-end: /v1/auth/google)
// ============================================

function mostrarErroSocial(msg) {
    const el = document.getElementById('socialError');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', Boolean(msg));
}

function setupGoogleLogin() {
    const googleBtn = document.getElementById('googleLogin');
    const clientId = VivaLeveAPI.googleClientId;

    if (!clientId) {
        // Sem Client ID: o botão fica, mas avisa em vez de fingir um login.
        googleBtn.addEventListener('click', function() {
            mostrarErroSocial('Login com Google ainda não configurado (GOOGLE_CLIENT_ID em js/api.js).');
        });
        return;
    }

    // Se a biblioteca do Google não carregar (bloqueador, sem internet), o botão avisa.
    googleBtn.addEventListener('click', function() {
        mostrarErroSocial('Não foi possível carregar o login do Google. Verifique sua conexão e recarregue a página.');
    });

    function iniciar() {
        google.accounts.id.initialize({
            client_id: clientId,
            callback: onGoogleCredential,
            ux_mode: 'popup'
        });
        const container = document.getElementById('googleButton');
        google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            locale: 'pt-BR',
            width: Math.min(container.parentElement.clientWidth || 320, 400)
        });
        container.style.display = 'flex';
        googleBtn.style.display = 'none';
    }

    if (window.google && google.accounts && google.accounts.id) {
        iniciar();
    } else {
        // Chamado pela própria biblioteca (gsi/client) quando termina de carregar.
        window.onGoogleLibraryLoad = iniciar;
    }
}

/** Recebe o ID Token do Google e troca pelo token da API. */
async function onGoogleCredential(response) {
    mostrarErroSocial('');
    try {
        await VivaLeveAPI.auth.google(response.credential);
        window.location.href = 'index.html';
    } catch (err) {
        let msg = 'Não foi possível entrar com o Google agora.';
        if (err.offline) msg = 'Não foi possível conectar ao servidor. Tente de novo em instantes.';
        else if (err.status === 401) msg = 'Não conseguimos confirmar sua conta Google. Tente de novo.';
        else if (err.status === 409) msg = 'Este email já está ligado a outra conta Google.';
        else if (err.status === 503) msg = 'O Google não respondeu. Tente de novo em instantes.';
        mostrarErroSocial(msg);
    }
}
