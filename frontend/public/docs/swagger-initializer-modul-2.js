function normalizeGasTryItOutRequest(request) {
  if (request.method !== "POST") return request;
  if (!request.url.includes("/macros/s/")) return request;

  request.headers = request.headers || {};
  request.headers["Content-Type"] = "text/plain;charset=UTF-8";

  if (
    request.body &&
    typeof request.body !== "string" &&
    !(request.body instanceof String)
  ) {
    request.body = JSON.stringify(request.body);
  }

  return request;
}

window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/openapi-modul-2.json",
    dom_id: "#swagger-ui",
    deepLinking: true,
    docExpansion: "list",
    displayRequestDuration: true,
    persistAuthorization: false,
    requestInterceptor: normalizeGasTryItOutRequest,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "BaseLayout",
  });
};
