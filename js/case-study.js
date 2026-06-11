import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cuanuyrdlklunggvihkw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LMROBtr-8VbSwLE-5cDIBw_DBLezLki";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const accessView = document.querySelector("[data-access-view]");
const form = document.querySelector("[data-password-form]");
const passwordInput = document.querySelector("[data-password-input]");
const submitButton = document.querySelector("[data-submit-button]");
const errorMessage = document.querySelector("[data-error-message]");
const caseStudy = document.querySelector("[data-case-study]");

const buttonContent = (label) => `
  ${label}
  <svg class="link-arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 9h9M10 5l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getSlugFromPath = () => {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const caseStudiesIndex = parts.indexOf("case-studies");

  if (caseStudiesIndex >= 0 && parts[caseStudiesIndex + 1]) {
    return decodeURIComponent(parts[caseStudiesIndex + 1]);
  }

  return decodeURIComponent(parts.at(-1) || "");
};

const normalizeCaseStudy = (data) => {
  if (Array.isArray(data)) {
    return data[0] || null;
  }

  if (data && typeof data === "object" && Object.keys(data).length === 0) {
    return null;
  }

  return data || null;
};

const formatText = (value = "") =>
  escapeHtml(value)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");

const getCaseMeta = (record) => {
  const content = record.content || record;

  return {
    title: content.hero?.title || content.title || record.title || "Case study privado",
    subtitle: content.hero?.eyebrow || content.eyebrow || record.eyebrow || "",
    summary:
      content.hero?.description ||
      content.description ||
      content.summary ||
      record.description ||
      record.summary ||
      "",
  };
};

const getHtmlContent = (record) => {
  const content = record.content || record;

  if (content?.mode === "html") {
    return content.html || "";
  }

  return "";
};

const renderEmptyState = (record) => {
  const meta = getCaseMeta(record);

  caseStudy.innerHTML = `
    <section class="private-content private-content--empty">
      ${meta.subtitle ? `<span>${escapeHtml(meta.subtitle)}</span>` : ""}
      <h1>${escapeHtml(meta.title)}</h1>
      ${meta.summary ? `<p>${formatText(meta.summary)}</p>` : ""}
      <p>Este case study todavia esta en construccion.</p>
    </section>
  `;
};

const renderJsonFallback = (record) => {
  const content = record.content || record;
  const meta = getCaseMeta(record);
  const metadata = content.metadata || record.metadata || [];
  const sections = content.sections || [];

  const metadataItems = Array.isArray(metadata)
    ? metadata
    : Object.entries(metadata).map(([label, value]) => ({ label, value }));

  caseStudy.innerHTML = `
    <section class="case-hero">
      <nav class="case-breadcrumb" aria-label="Breadcrumb">
        <a href="../../index.html">Home</a>
        <span>/</span>
        <span>Case study</span>
      </nav>
      <div class="case-hero__layout">
        <div>
          ${meta.subtitle ? `<span class="case-eyebrow">${escapeHtml(meta.subtitle)}</span>` : ""}
          <h1>${escapeHtml(meta.title)}</h1>
        </div>
        ${meta.summary ? `<div class="case-hero__summary"><p>${formatText(meta.summary)}</p></div>` : ""}
      </div>
    </section>
    ${
      metadataItems.length
        ? `<section class="case-meta">
            ${metadataItems
              .map(
                (item) => `
                  <div class="case-meta__item">
                    <span>${escapeHtml(item.label || item.title || "")}</span>
                    <p>${escapeHtml(item.value || item.body || "")}</p>
                  </div>
                `
              )
              .join("")}
          </section>`
        : ""
    }
    ${sections
      .map((section) => {
        const eyebrow = section.eyebrow ? `<span class="case-eyebrow">${escapeHtml(section.eyebrow)}</span>` : "";
        const title = section.title ? `<h2>${escapeHtml(section.title)}</h2>` : "";
        const body = section.body ? `<div class="case-copy"><p>${formatText(section.body)}</p></div>` : "";

        if (section.type === "highlight") {
          return `<section class="case-section case-section--highlight">${eyebrow}<p>${formatText(section.body || section.text || section.title || "")}</p></section>`;
        }

        if (section.type === "two_columns") {
          return `
            <section class="case-section case-section--two-columns">
              <div class="case-section__heading">${eyebrow}${title}</div>
              <div class="case-grid case-grid--two">
                <div class="case-copy"><p>${formatText(section.left || "")}</p></div>
                <div class="case-copy"><p>${formatText(section.right || "")}</p></div>
              </div>
            </section>
          `;
        }

        return `
          <section class="case-section case-section--text">
            <div class="case-section__heading">${eyebrow}${title}</div>
            ${body}
          </section>
        `;
      })
      .join("")}
  `;
};

const renderPrivateContent = (record) => {
  const content = record.content || record;

  if (content?.mode === "html") {
    const html = getHtmlContent(record).trim();

    if (html) {
      caseStudy.innerHTML = html;
    } else {
      renderEmptyState(record);
    }

    accessView.classList.add("is-hidden");
    caseStudy.classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (content?.html || record.html || record.body_html) {
    caseStudy.innerHTML = content.html || record.html || record.body_html;
  } else if (content?.sections || content?.hero || content?.metadata) {
    renderJsonFallback(record);
  } else {
    renderEmptyState(record);
  }

  accessView.classList.add("is-hidden");
  caseStudy.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};
      </section>
    `;
  }

  accessView.classList.add("is-hidden");
  caseStudy.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const setLoading = (isLoading) => {
  submitButton.disabled = isLoading;
  passwordInput.disabled = isLoading;
  submitButton.innerHTML = buttonContent(isLoading ? "Entrando..." : "Entrar");
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  const password = passwordInput.value.trim();

  if (!password) {
    errorMessage.textContent = "Ingresa la contraseña.";
    passwordInput.focus();
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.rpc("get_case_study_by_password", {
    p_slug: getSlugFromPath(),
    p_password: password,
  });

  setLoading(false);

  if (error) {
    errorMessage.textContent = "No se pudo validar la contraseña. Intenta de nuevo.";
    return;
  }

  const record = normalizeCaseStudy(data);

  if (!record) {
    errorMessage.textContent = "Contraseña incorrecta";
    passwordInput.select();
    return;
  }

  renderPrivateContent(record);
});
