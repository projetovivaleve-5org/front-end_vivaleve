/**
 * VivaLeve / Pluma - Comunicação com a API (back-end Spring Boot)
 *
 * - Guarda o token (JWT) do login e manda "Authorization: Bearer <token>" em toda chamada.
 * - Funções prontas para login/cadastro (/v1/auth/*) e para a IA (/v1/ai/*).
 *
 * URL da API:
 *  - Abrindo o front em localhost / 127.0.0.1: http://localhost:8080
 *  - Em produção: PRODUCAO_URL abaixo
 *  - Para testar outra URL sem mexer no código, abra qualquer página com
 *      ?api=http://localhost:8081
 *    (fica salvo no localStorage em "pluma_api_url"; para voltar ao padrão: ?api=padrao)
 */

(function () {
    // TODO: confirmar a URL pública do back-end (Render) antes do deploy.
    const PRODUCAO_URL = "https://back-endvivaleve-cpjz8ngd8-projeto-viva-leve.vercel.app";
    const LOCAL_URL = "http://localhost:8080";

    // O back espera até 30s pela IA; damos uma folga antes de desistir.
    const TIMEOUT_MS = 45000;

    const KEYS = {
        API_URL: "pluma_api_url",
        TOKEN: "pluma_token",
        TOKEN_EXPIRES: "pluma_token_expires",
        USER: "pluma_user",
        USER_NAME: "pluma_user_name",
        LOGGED_IN: "pluma_logged_in",
        CONVERSA_PREFIXO: "pluma_chat_conversa_"
    };

    // ?api=... na URL troca a API (útil para testar local em outra porta)
    const apiDaUrl = new URLSearchParams(window.location.search).get("api");
    if (apiDaUrl === "padrao") localStorage.removeItem(KEYS.API_URL);
    else if (apiDaUrl) localStorage.setItem(KEYS.API_URL, apiDaUrl);

    function baseUrl() {
        const override = localStorage.getItem(KEYS.API_URL);
        if (override) return override.replace(/\/$/, "");
        const local = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
        return local ? LOCAL_URL : PRODUCAO_URL;
    }

    // ------------------------------------------------------------ sessão

    function usuario() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.USER) || "{}");
        } catch {
            return {};
        }
    }

    /** Apaga o token. Os botões "Sair" das páginas só tiram o pluma_logged_in, então token() também chama isto. */
    function limparToken() {
        localStorage.removeItem(KEYS.TOKEN);
        localStorage.removeItem(KEYS.TOKEN_EXPIRES);
    }

    /** Token válido do usuário logado, ou null. */
    function token() {
        const t = localStorage.getItem(KEYS.TOKEN);
        if (!t) return null;
        const saiu = localStorage.getItem(KEYS.LOGGED_IN) !== "true";
        const expira = Date.parse(localStorage.getItem(KEYS.TOKEN_EXPIRES) || "");
        const expirou = !Number.isNaN(expira) && expira <= Date.now();
        if (saiu || expirou) {
            limparToken();
            return null;
        }
        return t;
    }

    /** Salva a resposta de /v1/auth/login, /register ou /google: { token, tokenType, expiresAt, user }. */
    function salvarSessao(auth) {
        const u = auth.user || {};
        const nome = u.name || (u.email ? u.email.split("@")[0] : "");
        localStorage.setItem(KEYS.TOKEN, auth.token);
        if (auth.expiresAt) localStorage.setItem(KEYS.TOKEN_EXPIRES, auth.expiresAt);
        localStorage.setItem(KEYS.USER, JSON.stringify({
            id: u.id,
            email: u.email,
            name: nome,
            pictureUrl: u.pictureUrl || null
        }));
        localStorage.setItem(KEYS.USER_NAME, nome);
        localStorage.setItem(KEYS.LOGGED_IN, "true");
    }

    // ------------------------------------------------------------ HTTP

    async function request(endpoint, options = {}) {
        const { semToken, ...fetchOptions } = options;
        const headers = { ...(fetchOptions.headers || {}) };
        if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        const t = token();
        if (t && !semToken) headers["Authorization"] = "Bearer " + t;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        let response;
        try {
            response = await fetch(baseUrl() + endpoint, {
                ...fetchOptions,
                headers,
                signal: controller.signal
            });
        } catch (e) {
            const motivo = e.name === "AbortError" ? "não respondeu a tempo" : "não está acessível";
            const err = new Error(`A API em ${baseUrl()} ${motivo}`);
            err.offline = true;
            console.error("[VivaLeve API]", err.message);
            throw err;
        } finally {
            clearTimeout(timer);
        }

        const text = await response.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = text;
        }

        if (!response.ok) {
            const err = new Error((data && data.message) || `Erro HTTP ${response.status}`);
            err.status = response.status;
            // Token ausente, inválido ou vencido: a pessoa precisa entrar de novo.
            if (response.status === 401 && !semToken) {
                limparToken();
                err.semLogin = true;
            }
            console.error("[VivaLeve API]", endpoint, err.message);
            throw err;
        }
        return data;
    }

    // ------------------------------------------------------------ login (/v1/auth)

    const auth = {
        /** Login com email e senha. Erro 401 = email ou senha inválidos. */
        async login(email, password) {
            const resp = await request("/v1/auth/login", {
                method: "POST",
                semToken: true,
                body: JSON.stringify({ email, password })
            });
            salvarSessao(resp);
            return resp.user;
        },

        /** Cadastro com email e senha (8 a 64 caracteres). Já entra logado. Erro 409 = email já cadastrado. */
        async register(email, password, name) {
            const resp = await request("/v1/auth/register", {
                method: "POST",
                semToken: true,
                body: JSON.stringify({ email, password, name: name || null })
            });
            salvarSessao(resp);
            return resp.user;
        },

        /** Login com o ID Token do botão "Entrar com Google" (Google Identity Services). */
        async google(credential) {
            const resp = await request("/v1/auth/google", {
                method: "POST",
                semToken: true,
                body: JSON.stringify({ credential })
            });
            salvarSessao(resp);
            return resp.user;
        },

        logado() {
            return token() !== null;
        },

        sair() {
            limparToken();
            localStorage.removeItem(KEYS.LOGGED_IN);
            localStorage.removeItem(KEYS.USER);
        }
    };

    // ------------------------------------------------------------ IA (/v1/ai)

    /** A conversa do chat é guardada por usuário, para não misturar contas no mesmo navegador. */
    function chaveConversa() {
        return KEYS.CONVERSA_PREFIXO + (usuario().id || "anon");
    }

    function nomeParaIa() {
        const nome = usuario().name || localStorage.getItem(KEYS.USER_NAME) || "";
        return nome ? nome.slice(0, 60) : null;
    }

    /**
     * Toda resposta da IA vem no mesmo formato:
     * { conversationId, messageId, useCase, status, reply, crisisDetected, helpResources, model, createdAt }
     * status: SUCCESS (resposta da IA) | FALLBACK (IA fora, texto padrão) | CRISIS (risco: mostrar CVV 188)
     */
    const ia = {
        /** Envia uma mensagem para a Pluma. Continua a conversa salva, se houver. */
        async conversar(mensagem) {
            const salva = localStorage.getItem(chaveConversa());
            const body = {
                conversationId: salva ? Number(salva) : null,
                message: mensagem,
                userName: nomeParaIa()
            };
            try {
                const resp = await request("/v1/ai/chat", { method: "POST", body: JSON.stringify(body) });
                localStorage.setItem(chaveConversa(), resp.conversationId);
                return resp;
            } catch (e) {
                // conversa apagada: começa uma nova e tenta de novo uma vez
                if (e.status === 404 && body.conversationId) {
                    localStorage.removeItem(chaveConversa());
                    return ia.conversar(mensagem);
                }
                throw e;
            }
        },

        /** Mensagens da conversa salva, em ordem ([] se não houver). Cada uma: { id, role, content, status, createdAt }. */
        async historico() {
            const salva = localStorage.getItem(chaveConversa());
            if (!salva) return [];
            try {
                return await request(`/v1/ai/conversations/${salva}/messages`, { method: "GET" });
            } catch (e) {
                if (e.status === 404) {
                    localStorage.removeItem(chaveConversa());
                    return [];
                }
                throw e;
            }
        },

        /** Apaga a conversa atual no back (se houver); a próxima mensagem abre outra. */
        async novaConversa() {
            const salva = localStorage.getItem(chaveConversa());
            localStorage.removeItem(chaveConversa());
            if (salva) {
                try {
                    await request(`/v1/ai/conversations/${salva}`, { method: "DELETE" });
                } catch (e) {
                    if (e.status !== 404) throw e;
                }
            }
        },

        /** Lista as conversas do usuário (mais recente primeiro). */
        conversas() {
            return request("/v1/ai/conversations", { method: "GET" });
        },

        /** Texto curto sobre as estatísticas de humor de 7 ou 30 dias (usa os registros salvos no back). */
        insightHumor(days = 7) {
            return request("/v1/ai/insights/mood", {
                method: "POST",
                body: JSON.stringify({ days, userName: nomeParaIa() })
            });
        },

        /** Comentário acolhedor sobre um registro de humor salvo no back (/v1/entries/{id}). */
        reflexaoRegistro(entryId) {
            return request(`/v1/ai/entries/${entryId}/reflection`, {
                method: "POST",
                body: JSON.stringify({ userName: nomeParaIa() })
            });
        }
    };

    window.VivaLeveAPI = {
        get baseURL() {
            return baseUrl();
        },
        request,
        auth,
        ia,
        usuario,

        get(endpoint) {
            return request(endpoint, { method: "GET" });
        },
        post(endpoint, body) {
            return request(endpoint, { method: "POST", body: JSON.stringify(body) });
        },
        put(endpoint, body) {
            return request(endpoint, { method: "PUT", body: JSON.stringify(body) });
        },
        delete(endpoint) {
            return request(endpoint, { method: "DELETE" });
        }
    };
})();
