export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: /api/config
    if (url.pathname === "/api/config") {
      if (request.method === "GET") {
        const saved = await env.ANANTAA_KV.get("shop:anantaa", "json");
        if (saved) return json(saved);

        try {
          const fallback = await env.ASSETS.fetch(
            new Request(new URL("/default-data.json", request.url))
          );
          if (fallback.ok) return fallback;
        } catch (e) {}

        return json({
          siteName: "Anantaa Creation"
        });
      }

      if (request.method === "PUT") {
        if (
          request.headers.get("X-Admin-Password") !==
          env.ADMIN_PASSWORD
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        const data = await request.json();

        await env.ANANTAA_KV.put(
          "shop:anantaa",
          JSON.stringify(data)
        );

        return json({ ok: true });
      }
    }

    // Dashboard
    if (url.pathname === "/dashboard") {
      url.pathname = "/dashboard.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    // Website root
    if (url.pathname === "/") {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    // All other static files
    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
