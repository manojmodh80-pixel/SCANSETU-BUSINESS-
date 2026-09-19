const DEFAULT_BUSINESS = {
  siteName: "YOUR BUSINESS NAME",
  eyebrow: "SCAN ONCE. CONNECT WITH US.",
  subtitle: "Your business description",
  logo: { url: "" },

  review: {
    title: "GIVE US A GOOGLE REVIEW",
    subtitle: "Share your genuine experience",
    url: ""
  },

  instagram: {
    title: "FOLLOW US ON INSTAGRAM",
    subtitle: "Latest updates • Reels • Offers",
    url: ""
  },

  facebook: {
    title: "FOLLOW US ON FACEBOOK",
    subtitle: "Stay connected with us",
    url: ""
  },

  payment: {
    title: "PAY NOW",
    subtitle: "UPI payment",
    upiId: ""
  },

  maps: {
    title: "GET DIRECTIONS",
    subtitle: "Find our business",
    url: ""
  },

  whatsapp: {
    title: "CHAT ON WHATSAPP",
    subtitle: "Enquiries & details",
    url: ""
  },

  phone: {
    title: "CALL NOW",
    subtitle: "Call our business",
    number: ""
  },

  footer: {
    name: "YOUR BUSINESS NAME",
    address: "Your business address"
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function getBusinessId(url) {
  const pathMatch = url.pathname.match(/^\/api\/config\/([^/]+)$/);

  if (pathMatch) {
    return decodeURIComponent(pathMatch[1])
      .trim()
      .toLowerCase();
  }

  return (
    url.searchParams.get("business") ||
    url.searchParams.get("shop") ||
    ""
  )
    .trim()
    .toLowerCase();
}

async function getConfig(env, businessId) {
  if (!businessId) {
    return DEFAULT_BUSINESS;
  }

  /*
   * New common business storage
   */
  const saved = await env.ANANTAA_KV.get(
    "business:" + businessId,
    "json"
  );

  if (saved) {
    return saved;
  }

  /*
   * Keep the existing Anantaa configuration working.
   */
  if (businessId === "anantaa") {
    const anantaa = await env.ANANTAA_KV.get(
      "anantaa-config-v1",
      "json"
    );

    if (anantaa) {
      return anantaa;
    }
  }

  return DEFAULT_BUSINESS;
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * BUSINESS CONFIG
     *
     * /api/config
     * /api/config/anantaa
     * /api/config?business=anantaa
     */
    if (
      request.method === "GET" &&
      (
        url.pathname === "/api/config" ||
        url.pathname.startsWith("/api/config/")
      )
    ) {
      const businessId = getBusinessId(url);
      const config = await getConfig(env, businessId);

      return json(config);
    }

    /*
     * SAVE BUSINESS
     */
    if (
      request.method === "PUT" &&
      (
        url.pathname === "/api/config" ||
        url.pathname.startsWith("/api/config/")
      )
    ) {
      const password = request.headers.get("X-Admin-Password");

      if (!password || password !== env.ADMIN_PASSWORD) {
        return json(
          {
            ok: false,
            error: "Unauthorized"
          },
          401
        );
      }

      const data = await request.json();

      let businessId =
        data.businessId ||
        getBusinessId(url);

      businessId = String(businessId || "")
        .trim()
        .toLowerCase();

      if (!businessId) {
        return json(
          {
            ok: false,
            error: "Business ID is required"
          },
          400
        );
      }

      data.businessId = businessId;

      await env.ANANTAA_KV.put(
        "business:" + businessId,
        JSON.stringify(data)
      );

      return json({
        ok: true,
        businessId
      });
    }

    /*
     * DASHBOARD
     *
     * Both URLs work:
     * /dashboard
     * /dashboard.html
     */
    if (
      url.pathname === "/dashboard" ||
      url.pathname === "/dashboard/"
    ) {
      const dashboardUrl = new URL(
        "/dashboard.html",
        request.url
      );

      return env.ASSETS.fetch(
        new Request(dashboardUrl, request)
      );
    }

    /*
     * HOME PAGE
     */
    if (
      url.pathname === "/" ||
      url.pathname === ""
    ) {
      const homeUrl = new URL(
        "/index.html",
        request.url
      );

      return env.ASSETS.fetch(
        new Request(homeUrl, request)
      );
    }

    /*
     * ALL STATIC FILES
     */
    return env.ASSETS.fetch(request);
  }
};

export default worker;
