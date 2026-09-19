let data = null;

async function loadData() {
  try {
    const params = new URLSearchParams(window.location.search);

    // Supports ?business=xyz or ?shop=xyz
    const businessId =
      params.get("business") ||
      params.get("shop") ||
      "demo";

    let url = "/api/config";

    // If the Worker supports business-specific configs,
    // use the business ID automatically.
    if (businessId && businessId !== "demo") {
      url = "/api/config/" + encodeURIComponent(businessId);
    }

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Business configuration not found");
    }

    data = await res.json();
    render(data);
  } catch (error) {
    console.error("Business configuration error:", error);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.textContent = value;
  }
}

function setLink(id, value) {
  const el = document.getElementById(id);

  if (el && value) {
    el.href = value;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  }
}

function render(c) {
  if (!c) return;

  // Logo
  const logo = document.querySelector(".logo");

  if (logo && c.logo && c.logo.url) {
    logo.src = c.logo.url;
  }

  // Main business information
  setText("siteName", c.siteName);
  setText("eyebrow", c.eyebrow);
  setText("subtitle", c.subtitle);

  // Google Review
  if (c.review) {
    setText("reviewTitle", c.review.title);
    setText("reviewSubtitle", c.review.subtitle);
    setLink("reviewBtn", c.review.url);
  }

  // Instagram
  if (c.instagram) {
    setText("instagramTitle", c.instagram.title);
    setText("instagramSubtitle", c.instagram.subtitle);
    setLink("instagramBtn", c.instagram.url);
  }

  // Facebook
  if (c.facebook) {
    setText("facebookTitle", c.facebook.title);
    setText("facebookSubtitle", c.facebook.subtitle);
    setLink("facebookBtn", c.facebook.url);
  }

  // Payment
  if (c.payment) {
    setText("paymentTitle", c.payment.title);
    setText("paymentSubtitle", c.payment.subtitle);
  }

  // Maps
  if (c.maps) {
    setText("mapsTitle", c.maps.title);
    setText("mapsSubtitle", c.maps.subtitle);
    setLink("mapsBtn", c.maps.url);
  }

  // WhatsApp
  if (c.whatsapp) {
    setText("whatsappTitle", c.whatsapp.title);
    setText("whatsappSubtitle", c.whatsapp.subtitle);
    setLink("whatsappBtn", c.whatsapp.url);
  }

  // Phone
  if (c.phone) {
    setText("phoneTitle", c.phone.title);
    setText("phoneSubtitle", c.phone.subtitle);

    const phoneBtn = document.getElementById("phoneBtn");

    if (phoneBtn && c.phone.number) {
      phoneBtn.href = "tel:" + c.phone.number;
    }
  }

  // Footer
  if (c.footer) {
    setText("footerName", c.footer.name);
    setText("footerAddress", c.footer.address);
  }

  // UPI Payment
  const upiBtn = document.getElementById("upiBtn");

  if (upiBtn && c.payment && c.payment.upiId) {
    upiBtn.onclick = function () {
      const upiUrl =
        "upi://pay?pa=" +
        encodeURIComponent(c.payment.upiId) +
        "&pn=" +
        encodeURIComponent(c.siteName || "Business") +
        "&cu=INR";

      window.location.href = upiUrl;
    };
  }

  // Page title is also business-specific
  if (c.siteName) {
    document.title = c.siteName;
  }
}

function openModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadData();

  document.querySelectorAll("[data-open-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      openModal(button.getAttribute("data-open-modal"));
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      closeModal(button.getAttribute("data-close-modal"));
    });
  });

  document.querySelectorAll(".modal").forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
});
