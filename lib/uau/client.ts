import { getUauApiUrl, getUauConfig } from "@/lib/config";
import { UauApiError } from "./uau-api-error";
import { UauAuthError } from "./uau-auth-error";

const TOKEN_TTL_MS = 90 * 60 * 1000;

interface CachedToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export class UauClient {
  private baseUrl: string;
  private usuario: string;
  private senha: string;
  private integrationToken: string;

  constructor() {
    const config = getUauConfig();
    this.baseUrl = getUauApiUrl();
    this.usuario = config.usuario;
    this.senha = config.senha;
    this.integrationToken = config.integrationToken;
  }

  async post(endpoint: string, payload: Record<string, unknown> = {}) {
    const token = await this.authenticate();
    const response = await this.request(endpoint, payload, token);

    if (response.status === 401) {
      cachedToken = null;
      const refreshed = await this.authenticate(true);
      const retry = await this.request(endpoint, payload, refreshed);
      return this.parseResponse(retry);
    }

    return this.parseResponse(response);
  }

  getUsuario() {
    return this.usuario;
  }

  private async authenticate(force = false): Promise<string> {
    if (!force && cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.value;
    }

    if (!this.usuario || !this.senha) {
      throw new UauAuthError("Credenciais UAU não configuradas");
    }

    const url = `${this.baseUrl}/Autenticador/AutenticarUsuario`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.integrationToken) {
      headers["X-INTEGRATION-Authorization"] = this.integrationToken;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ Login: this.usuario, Senha: this.senha }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new UauAuthError(
        `Falha na autenticação UAU: [${response.status}] ${body}`
      );
    }

    const data = await response.json();
    const token = this.extractToken(data);
    cachedToken = { value: token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  }

  private extractToken(data: unknown): string {
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      const token = record.token || record.Token;
      if (typeof token === "string") return token;
    }
    return String(data);
  }

  private async request(
    endpoint: string,
    payload: Record<string, unknown>,
    token: string
  ) {
    const url = `${this.baseUrl}/${endpoint}`;
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-INTEGRATION-Authorization": this.integrationToken,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
  }

  private async parseResponse(response: Response) {
    const text = await response.text();
    if (!response.ok) {
      throw new UauApiError(response.status, text);
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
