const GENERIC_BUSINESS = {
  siteName: "YOUR BUSINESS NAME",
  eyebrow: "SCAN ONCE. CONNECT WITH US.",
  subtitle: "Your business description",
  logo: {
    url: ""
  },
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

async function getBusinessConfig(env, businessId) {
  const id = (businessId || "").trim().toLowerCase();

  if (!id) {
    return GENERIC_BUSINESS;
  }

  // New common business storage
  const saved = await env.ANANTAA_KV.get(
    "business:" + id,
    "json"
  );

  if (saved) {
    return saved;
  }

  // Keep old Anantaa configuration working
  if (id === "anantaa") {
    const oldData = await env.ANANTAA_KV.get(
      "anantaa-config-v1",
      "json"
    );

    if (oldData) {
      return oldData;
    }
  }

  // Try default-data.json for a matching/default business
  try {
    const asset = await env.ASSETS.fetch(
      new Request(
        new URL("/default-data.json", "https://assets.local")
      )
    );

    if (asset.ok) {
      const defaultData = await asset.json();

      if (
        defaultData.businessId &&
        String(defaultData.businessId).toLowerCase() === id
      ) {
        return defaultData;
      }

      if (id === "anantaa" && defaultData.siteName) {
        return defaultData;
      }
    }
  } catch (error) {
    console.error("Default data error:", error);
  }

  return GENERIC_BUSINESS;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function getBusinessIdFromRequest(url) {
  const pathMatch = url.pathname.match(
    /^\/api\/config\/([^/]+)$/
  );

  if (pathMatch) {
    return decodeURIComponent(pathMatch[1]);
  }

  return url.searchParams.get("business") ||
         url.searchParams.get("shop") ||
         "";
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * GET BUSINESS CONFIG
     *
     * Examples:
     * /api/config
     * /api/config/anantaa
     * /api/config/business2
     * /api/config?business=business2
     */
    if (
      request.method === "GET" &&
      (url.pathname === "/api/config" ||
       url.pathname.startsWith("/api/config/"))
    ) {
      const businessId = getBusinessIdFromRequest(url);
      const config = await getBusinessConfig(env, businessId);

      return json(config);
    }

    /*
     * SAVE BUSINESS CONFIG
     *
     * Header:
     * X-Admin-Password
     *
     * Business ID can come from:
     * body.businessId
     * ?business=...
     * ?shop=...
     */
    if (
      request.method === "PUT" &&
      (url.pathname === "/api/config" ||
       url.pathname.startsWith("/api/config/"))
    ) {
      if (
        request.headers.get("X-Admin-Password") !==
        env.ADMIN_PASSWORD
      ) {
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
        getBusinessIdFromRequest(url);

      businessId = String(
        businessId || "demo"
      )
        .trim()
        .toLowerCase();

      // Keep businessId inside saved data
      data.businessId = businessId;

      await env.ANANTAA_KV.put(
        "business:" + businessId,
        JSON.stringify(data)
      );

      return json({
        ok: true,
        businessId: businessId
      });
    }

    /*
     * DASHBOARD
     */
    if (url.pathname === "/dashboard") {
      url.pathname = "/dashboard.html";

      return env.ASSETS.fetch(
        new Request(url, request)
      );
    }

    /*
     * HOME PAGE
     */
    if (url.pathname === "/") {
      url.pathname = "/index.html";

      return env.ASSETS.fetch(
        new Request(url, request)
      );
    }

    /*
     * STATIC ASSETS
     */
    return env.ASSETS.fetch(request);
  }
};

export default worker;
