export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/config\/([^/]+)$/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      if (request.method === "GET") {
        const saved = await env.SCANSETU_KV.get("shop:" + slug, "json");
        if (saved) return json(saved);
        if (slug === "demo") {
          return json({siteName:"Anantaa Creation",tagline:"Designer Sarees | Chaniya Choli | Indo-Western Dresses",links:[
            {title:"Google Review",url:"https://g.page/r/Ce_5OmgsbRJuEBE/review",subtitle:"Share your genuine experience"},
            {title:"Instagram",url:"https://www.instagram.com/anantaacreation/",subtitle:"New arrivals • Reels • Offers"},
            {title:"Facebook",url:"https://www.facebook.com/",subtitle:"Stay connected"},
            {title:"WhatsApp",url:"https://wa.me/",subtitle:"Chat with us"},
            {title:"Get Directions",url:"https://maps.google.com/",subtitle:"Find our store"}]});
        }
        return new Response("Not found",{status:404});
      }
      if (request.method === "PUT") {
        if (request.headers.get("X-Admin-Password") !== env.ADMIN_PASSWORD) return new Response("Unauthorized",{status:401});
        const data = await request.json();
        await env.SCANSETU_KV.put("shop:" + slug, JSON.stringify(data));
        return json({ok:true});
      }
    }
    if (url.pathname.startsWith("/r/")) {
      url.pathname="/index.html";
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  }
};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8"}})}