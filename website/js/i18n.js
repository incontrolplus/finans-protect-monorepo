/* ==========================================================================
   OpenBalancer — Bilingual Internationalization Engine (BG / EN)
   Operated by INCONTROL PLUS ЕООД
   ========================================================================== */

const translations = {
  en: {
    // Navigation
    "nav_benchmarks": "Benchmarks",
    "nav_architecture": "Architecture",
    "nav_simulator": "Live Visualizer",
    "nav_enterprise": "Enterprise SLA",
    "nav_pricing": "Pricing",
    "nav_retainers": "Retainers",
    "nav_request_sla": "Request Enterprise SLA",

    // Hero
    "hero_tag": "Core Engine: Async Socket Event Loop • v1.4.0-stable • MIT License",
    "hero_title": "High-Throughput Asynchronous Load Balancer & Reverse Proxy",
    "hero_subtitle": "Distribute mission-critical API traffic, LLM token streams, and microservice workloads with sub-millisecond overhead, active health probing, and automated circuit breaking.",
    "hero_cta_simulator": "Launch Live Visualizer",
    "hero_cta_github": "View Source on GitHub",
    "hero_cta_audit": "Enterprise Architecture Audit",

    // Benchmarks
    "bench_req_sec": "Req / Sec Throughput",
    "bench_latency": "p99 Routing Latency",
    "bench_conns": "Max Concurrent Conns",
    "bench_rss": "Core RSS Footprint",

    // Terminal
    "terminal_copy": "Copy Snippet",
    "terminal_copied": "Copied!",

    // Architecture
    "arch_tag": "Kernel & Event Loop Architecture",
    "arch_title": "Engineered for High-Concurrency Protocols",
    "arch_subtitle": "Built from the ground up on non-blocking asynchronous sockets with zero external dependencies in the hot path.",
    "feat1_title": "Protocol Agnostic Routing",
    "feat1_desc": "Full support for HTTP/1.1, HTTP/2 multiplexing, long-lived WebSockets, Server-Sent Events (SSE), and gRPC streaming.",
    "feat2_title": "Active Circuit Breaking",
    "feat2_desc": "Detects consecutive 5xx errors or socket timeouts in milliseconds, instantly tripping degraded upstream backends out of the pool.",
    "feat3_title": "Multi-Algorithm Balancing",
    "feat3_desc": "Select between Weighted Round-Robin, Smooth Least Connections, and Consistent IP Hash Rings for session sticky routing.",

    // Simulator
    "sim_tag": "Interactive Testbench",
    "sim_title": "Live Traffic & Failover Visualizer",
    "sim_subtitle": "Observe how OpenBalancer dynamically distributes socket requests and reroutes traffic when an upstream node fails.",
    "sim_processed_reqs": "Processed Requests",
    "sim_observed_latency": "Observed Latency",
    "sim_dispatched_node": "Dispatched Node",
    "sim_btn_outage": "Simulate Node 2 Outage",
    "sim_btn_restore": "Restore Node 2 Health",
    "sim_btn_send": "Send Test Socket Request",
    "sim_client_ingress": "Client Ingestion",
    "sim_client_sub": "TCP Sockets & Webhooks",
    "sim_core_title": "OpenBalancer Core",
    "sim_core_sub": "Weighted Round-Robin",

    // Enterprise
    "ent_tag": "Enterprise SLA Backing",
    "ent_title": "Production Infrastructure & SLA Management",
    "ent_p1": "OpenBalancer is backed and operated by <strong>INCONTROL PLUS ЕООД</strong>. We provide formal B2B Master Services Agreements (MSA), guaranteed 99.9% uptime SLAs, and sub-15 minute emergency incident response for corporate engineering teams.",
    "ent_highlight1_title": "99.9% Uptime Guarantee",
    "ent_highlight1_desc": "Contractual SLA with automated service credits for downtime under 99.9%.",
    "ent_highlight2_title": "Sub-15 Min Critical Incident SLA",
    "ent_highlight2_desc": "24/7 direct escalation hotline to senior infrastructure architects.",
    "ent_highlight3_title": "Net-14 Corporate Invoicing",
    "ent_highlight3_desc": "EU VAT compliant invoicing processed securely via Stripe Invoicing.",

    // Pricing
    "pricing_tag": "Pricing & Retainers",
    "pricing_title": "Transparent Licensing & B2B Support Tiers",
    "pricing_subtitle": "Deploy OpenBalancer for free under the MIT license, or partner with INCONTROL PLUS for guaranteed B2B SLAs.",
    "plan1_title": "Community Open-Source",
    "plan1_desc": "For developers and self-hosted environments.",
    "plan1_btn": "Download Community Core",
    "plan2_popular": "Corporate SLA",
    "plan2_title": "B2B Pro SLA Retainer",
    "plan2_desc": "For high-availability production clusters.",
    "plan2_btn": "Request SLA Contract",
    "plan3_title": "Custom Enterprise SLA",
    "plan3_desc": "For multi-region and high-throughput systems.",
    "plan3_btn": "Contact Sales",

    // Payment Trust Bar
    "trust_title": "Secured B2B Invoicing & Retainers",
    "trust_desc": "Encrypted 256-bit TLS payments processed via Stripe with Net-14 corporate invoicing terms.",

    // Footer
    "footer_desc": "OpenBalancer is an intelligent open-source load balancing and API reverse proxy system operated and supported by INCONTROL PLUS ЕООД.",
    "footer_col_arch": "Architecture",
    "footer_col_comp": "Compliance",
    "footer_col_entity": "Operating Entity",
    "footer_tos": "Terms of Service (ToS)",
    "footer_privacy": "Privacy Policy (GDPR)",
    "footer_refunds": "Refund & SLA Policy",
    "footer_verify": "Company Verification",
    "footer_rights": "© 2026 INCONTROL PLUS ЕООД. All rights reserved. OpenBalancer™ is a trademark of INCONTROL PLUS.",

    // Modal
    "modal_title": "Request Enterprise SLA & Invoicing",
    "modal_subtitle": "Direct engagement with <strong>INCONTROL PLUS ЕООД</strong>. Receive a formal B2B proposal and SLA terms within 2 hours.",
    "modal_lbl_company": "Company Legal Name *",
    "modal_lbl_vat": "VAT / Registry ID",
    "modal_lbl_email": "Work Email *",
    "modal_lbl_phone": "Corporate Phone",
    "modal_lbl_plan": "Selected Retainer / SLA *",
    "modal_lbl_scope": "Cluster Scope & Target Throughput",
    "modal_btn_submit": "Submit B2B Inquiry & Request Invoicing",
    "modal_success_title": "Inquiry Registered Successfully",
    "modal_success_desc": "Our senior infrastructure lead at INCONTROL PLUS will review your specifications and send an official B2B proposal and Net-14 invoicing schedule to",

    // Cookie Banner
    "cookie_text": "<strong>GDPR Notice:</strong> OpenBalancer uses strictly necessary cookies for telemetry routing and secure B2B session handling. See",
    "cookie_accept": "Accept All",
    "cookie_dismiss": "Essential Only"
  },

  bg: {
    // Navigation
    "nav_benchmarks": "Бенчмаркове",
    "nav_architecture": "Архитектура",
    "nav_simulator": "Симулатор на живо",
    "nav_enterprise": "Enterprise SLA",
    "nav_pricing": "Цени & Планове",
    "nav_retainers": "Абонаменти",
    "nav_request_sla": "Заяви Enterprise SLA",

    // Hero
    "hero_tag": "Ядро: Асинхронен сокет цикъл • v1.4.0-stable • MIT Лиценз",
    "hero_title": "Високопроизводителен асинхронен балансьор на натоварването & Reverse Proxy",
    "hero_subtitle": "Разпределяйте критичен API трафик, LLM токен потоци и микросървиси с подмилисекундно забавяне, активен health probing и автоматичен circuit breaker.",
    "hero_cta_simulator": "Стартирай симулатора",
    "hero_cta_github": "Виж кода в GitHub",
    "hero_cta_audit": "Одит на архитектурата",

    // Benchmarks
    "bench_req_sec": "Заявки / сек. капацитет",
    "bench_latency": "p99 Латентност на маршрутизация",
    "bench_conns": "Макс. едновременни връзки",
    "bench_rss": "RSS памет на ядрото",

    // Terminal
    "terminal_copy": "Копирай кода",
    "terminal_copied": "Копирано!",

    // Architecture
    "arch_tag": "Архитектура на сокети & събитиен цикъл",
    "arch_title": "Проектиран за високочестотни протоколи",
    "arch_subtitle": "Изграден от основата върху неблокиращи асинхронни сокети без външни зависимости в критичния път.",
    "feat1_title": "Протоколно-независимо маршрутизиране",
    "feat1_desc": "Пълна поддръжка за HTTP/1.1, HTTP/2 мултиплексиране, постоянни WebSockets, Server-Sent Events (SSE) и gRPC streaming.",
    "feat2_title": "Активен Circuit Breaking",
    "feat2_desc": "Засича поредни 5xx грешки или сокет таймаути за милисекунди и незабавно изолира компрометираните възли от пула.",
    "feat3_title": "Многоалгоритмично балансиране",
    "feat3_desc": "Избор между Weighted Round-Robin, Smooth Least Connections и Consistent IP Hash Ring за сесионна консистентност.",

    // Simulator
    "sim_tag": "Интерактивен тестов стенд",
    "sim_title": "Симулатор на трафик & отпадане на възел в реално време",
    "sim_subtitle": "Наблюдавайте как OpenBalancer динамично разпределя сокет заявките и премаршрутира трафика при отпадане на възел.",
    "sim_processed_reqs": "Обработени заявки",
    "sim_observed_latency": "Измерена латентност",
    "sim_dispatched_node": "Маршрутизиран възел",
    "sim_btn_outage": "Симулирай отпадане на Node 2",
    "sim_btn_restore": "Възстанови здравето на Node 2",
    "sim_btn_send": "Изпрати тестова заявка",
    "sim_client_ingress": "Входящ трафик",
    "sim_client_sub": "TCP Сокети & Webhooks",
    "sim_core_title": "OpenBalancer Ядро",
    "sim_core_sub": "Претеглен Round-Robin",

    // Enterprise
    "ent_tag": "Гарантирана Enterprise SLA поддръжка",
    "ent_title": "Производствена инфраструктура & SLA управление",
    "ent_p1": "OpenBalancer се поддържа и оперира от <strong>ИНКОНТРОЛ ПЛЮС ЕООД</strong>. Предоставяме официални B2B договори за услуги (MSA), гарантиран 99.9% ъптайм SLA и реакция при критични инциденти под 15 минути.",
    "ent_highlight1_title": "99.9% Гарантиран Ъптайм",
    "ent_highlight1_desc": "Договорен SLA с автоматични кредити за услуги при ъптайм под 99.9%.",
    "ent_highlight2_title": "Под 15 мин. реакция при инцидент",
    "ent_highlight2_desc": "24/7 директна линия за ескалация към старши инфраструктурни архитекти.",
    "ent_highlight3_title": "Net-14 Корпоративно фактуриране",
    "ent_highlight3_desc": "ДДС-съвместимо B2B фактуриране, обработвано сигурно чрез Stripe Invoicing.",

    // Pricing
    "pricing_tag": "Цени & Абонаменти",
    "pricing_title": "Прозрачно лицензиране & B2B планове за поддръжка",
    "pricing_subtitle": "Внедрете OpenBalancer безплатно под MIT лиценз или сключете партньорство с ИНКОНТРОЛ ПЛЮС за гарантиран SLA.",
    "plan1_title": "Community с отворен код",
    "plan1_desc": "За разработчици и самостоятелно хоствани среди.",
    "plan1_btn": "Свали Community Core",
    "plan2_popular": "Корпоративен SLA",
    "plan2_title": "B2B Pro SLA Абонамент",
    "plan2_desc": "За високодостъпни производствени клъстери.",
    "plan2_btn": "Заяви SLA Договор",
    "plan3_title": "Персонализиран Enterprise SLA",
    "plan3_desc": "За мулти-регионални и високочестотни системи.",
    "plan3_btn": "Свържи се с нас",

    // Payment Trust Bar
    "trust_title": "Сигурно B2B Фактуриране & Абонаменти",
    "trust_desc": "Криптирани 256-bit TLS плащания, обработвани чрез Stripe с Net-14 корпоративни условия.",

    // Footer
    "footer_desc": "OpenBalancer е високопроизводителна система за балансиране на натоварването и API reverse proxy, оперирана и поддържана от ИНКОНТРОЛ ПЛЮС ЕООД.",
    "footer_col_arch": "Архитектура",
    "footer_col_comp": "Правни & Политики",
    "footer_col_entity": "Опериращо дружество",
    "footer_tos": "Общи условия (ToS)",
    "footer_privacy": "Политика за поверителност (GDPR)",
    "footer_refunds": "Политика за възстановяване & SLA",
    "footer_verify": "Фирмена идентификация",
    "footer_rights": "© 2026 ИНКОНТРОЛ ПЛЮС ЕООД. Всички права запазени. OpenBalancer™ е търговска марка на ИНКОНТРОЛ ПЛЮС.",

    // Modal
    "modal_title": "Запитване за Enterprise SLA & Фактуриране",
    "modal_subtitle": "Директен контакт с <strong>ИНКОНТРОЛ ПЛЮС ЕООД</strong>. Получете официална B2B оферта и SLA условия до 2 часа.",
    "modal_lbl_company": "Юридическо име на фирмата *",
    "modal_lbl_vat": "ЕИК / ДДС Номер",
    "modal_lbl_email": "Служебен имейл *",
    "modal_lbl_phone": "Служебен телефон",
    "modal_lbl_plan": "Избран абонаментен план / SLA *",
    "modal_lbl_scope": "Мащаб на клъстера & Целеви трафик",
    "modal_btn_submit": "Изпрати B2B запитване за фактуриране",
    "modal_success_title": "Запитването е регистрирано успешно",
    "modal_success_desc": "Нашият старши инфраструктурен екип в ИНКОНТРОЛ ПЛЮС ще прегледа спецификациите и ще изпрати официално B2B предложение и график за фактуриране на",

    // Cookie Banner
    "cookie_text": "<strong>GDPR Известие:</strong> OpenBalancer използва строго необходими бисквитки за маршрутизация и сигурни B2B сесии. Вижте",
    "cookie_accept": "Приеми всички",
    "cookie_dismiss": "Само необходими"
  }
};

let currentLang = localStorage.getItem('openbalancer_lang') || 'en';

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('openbalancer_lang', lang);
  document.documentElement.lang = lang;

  // Update switcher button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Apply translations to data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Apply translations to placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });
}

function initLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  setLanguage(currentLang);
}

window.openbalancer_i18n = {
  setLanguage,
  getLanguage: () => currentLang,
  translations
};
