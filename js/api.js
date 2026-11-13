/**
 * VivaLeve - Comunicação com API
 * Camada central de integração com o backend
 */

(function () {
    const API_BASE_URL =
        "https://back-endvivaleve-cpjz8ngd8-projeto-viva-leve.vercel.app";

    async function request(endpoint, options = {}) {
        const headers = {
            ...options.headers
        };
        if (options.body && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        try {
            const response = await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );
            const text = await response.text();

            let data = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = text;
            }
            if (!response.ok) {
                throw new Error(
                    data?.message || `Erro HTTP ${response.status}`
                );
            }
            return data;

        } catch (error) {
            console.error("[VivaLeve API]", error);
            throw error;
        }
    }
    window.VivaLeveAPI = {
        baseURL: API_BASE_URL,

        get(endpoint) {
            return request(endpoint, {
                method: "GET"
            });
        },
        post(endpoint, body) {
            return request(endpoint, {
                method: "POST",
                body: JSON.stringify(body)
            });
        },
        put(endpoint, body) {
            return request(endpoint, {
                method: "PUT",
                body: JSON.stringify(body)
            });
        },
        delete(endpoint) {
            return request(endpoint, {
                method: "DELETE"
            });
        }
    };
    console.log("[VivaLeve] Camada de API inicializada.");
})();