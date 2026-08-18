export const DEFAULT_EMPRESA = "9999";
export const DEFAULT_ORCAMENTO = 1;
export const DEFAULT_FLAGGED_CATEGORY = "pro";

export function getUauConfig() {
  return {
    baseUrl: process.env.UAU_BASE_URL || "https://apiglobalteccac.fwc.cloud:36000",
    apiVersion: process.env.UAU_API_VERSION || "1",
    usuario: process.env.UAU_USUARIO || "",
    senha: process.env.UAU_SENHA || "",
    integrationToken: process.env.UAU_INTEGRATION_TOKEN || "",
    empresa: process.env.UAU_EMPRESA || DEFAULT_EMPRESA,
    orcamento: Number(process.env.UAU_ORCAMENTO || DEFAULT_ORCAMENTO),
    mock: process.env.UAU_MOCK === "true",
  };
}

export function getTestLlmConfig() {
  return {
    flaggedCategory: (
      process.env.TEST_LLM_FLAGGED_CATEGORY || DEFAULT_FLAGGED_CATEGORY
    ).toLowerCase(),
  };
}

export function getUauApiUrl() {
  const { baseUrl, apiVersion } = getUauConfig();
  return `${baseUrl.replace(/\/$/, "")}/api/v${apiVersion}`;
}

export function hasUauCredentials() {
  const { usuario, senha, integrationToken, mock } = getUauConfig();
  if (mock) return true;
  return Boolean(usuario && senha && integrationToken);
}
