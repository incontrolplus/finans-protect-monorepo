/* ==========================================================================
   OpenBalancer — Robust Internationalization Engine (BG / EN)
   Operated by INCONTROL PLUS ЕООД
   ========================================================================== */

(function () {
  const translations = {
    en: {
      // Navigation
      "nav_benchmarks": "Benchmarks",
      "nav_architecture": "Architecture",
      "nav_simulator": "Live Visualizer",
      "nav_matrix": "Comparison Matrix",
      "nav_config": "Config Builder",
      "nav_enterprise": "Enterprise SLA",
      "nav_pricing": "Pricing",
      "nav_faq": "FAQ",
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

      // Simulator & Prometheus Telemetry
      "sim_tag": "Interactive Testbench",
      "sim_title": "Live Traffic & Failover Visualizer",
      "sim_subtitle": "Observe how OpenBalancer dynamically distributes socket requests and reroutes traffic when an upstream node fails.",
      "sim_chart_title": "Live Real-Time Ingress Telemetry (Prometheus Metric Stream)",
      "sim_chart_live": "LIVE STREAM",
      "sim_processed_reqs": "Processed Requests",
      "sim_observed_latency": "Observed Latency",
      "sim_btn_outage": "Crash Node 2 (Failover)",
      "sim_btn_restore": "Restore Node 2 Health",
      "sim_btn_latency": "Inject 500ms Spike (Node 1)",
      "sim_btn_surge": "Surge (1k Req/s)",
      "sim_btn_reset": "Reset Cluster",
      "sim_btn_send": "Send Socket Request",
      "sim_event_baseline": "Cluster Status: All 3 upstream nodes online. Dynamic load distribution active.",
      "sim_event_outage": "Chaos Alert: Node 2 crashed (503). Traffic rerouted to Node 1 and Node 3 with 0 dropped packets.",
      "sim_event_latency": "Circuit Breaker: High latency detected on Node 1 (520ms). Shedding traffic to healthy peers.",
      "sim_event_surge": "Stress Test: 1,000 req/sec burst ingested. Asynchronous queue depth optimal.",
      "sim_event_reset": "Cluster Status: All nodes restored to healthy baseline (12ms latency).",
      "sim_client_ingress": "Client Ingestion",
      "sim_client_sub": "TCP Sockets & Webhooks",
      "sim_core_title": "OpenBalancer Core",
      "sim_core_sub": "Weighted Round-Robin",

      // Comparison Matrix
      "matrix_tag": "Open Source Benchmark Matrix",
      "matrix_title": "OpenBalancer vs Traditional Edge Proxies",
      "matrix_subtitle": "Architected specifically for low-overhead async AI inference routing and mission-critical microservice clusters.",
      "col_feature": "Feature / Capability",
      "col_openbalancer": "OpenBalancer v1.4",
      "col_nginx": "NGINX Community",
      "col_haproxy": "HAProxy Community",
      "col_traefik": "Traefik Proxy",
      "m_f1": "Async Non-Blocking Core",
      "m_f2": "LLM Token Stream & SSE Passthrough",
      "m_f3": "Active Health Probing & Circuit Breaking",
      "m_f4": "Memory Footprint (RSS)",
      "m_f5": "Sub-millisecond p99 Routing Overhead",
      "m_f6": "Guaranteed B2B 99.9% Uptime SLA Backing",

      // Config Generator
      "cfg_tag": "Interactive Config Playground",
      "cfg_title": "Cluster Configuration Generator",
      "cfg_subtitle": "Customize your cluster parameters, upstream weights, and health probes with instant JSON validation and 1-click download.",
      "cfg_lbl_algo": "Routing Algorithm",
      "cfg_lbl_port": "Listen Port",
      "cfg_lbl_probe": "Health Check Interval",
      "cfg_lbl_cb": "Circuit Breaker Threshold",
      "cfg_lbl_timeout": "Socket Connection Timeout",
      "cfg_lbl_upstreams": "Configured Upstream Backends",
      "cfg_btn_add": "+ Add Backend Node",
      "cfg_btn_download": "Download openbalancer.json",
      "cfg_btn_copy": "Copy Config",
      "cfg_copied": "Copied!",

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
      "plan1_f1": "Full Core Routing Engine (MIT)",
      "plan1_f2": "Round-robin & Weighted Algorithms",
      "plan1_f3": "Active Health Probing & Metrics",
      "plan1_f4": "Docker Swarm & K8s Support",
      "plan1_btn": "Download Community Core",
      
      "plan2_popular": "Corporate SLA",
      "plan2_title": "B2B Pro SLA Retainer",
      "plan2_desc": "For high-availability production clusters.",
      "plan2_f1": "99.9% Contractual Uptime SLA",
      "plan2_f2": "Sub-15 Min Critical Incident SLA",
      "plan2_f3": "Hardened Multi-Node Configuration",
      "plan2_f4": "Official B2B Invoice via Stripe",
      "plan2_btn": "Request SLA Contract",
      
      "plan3_title": "Custom Enterprise SLA",
      "plan3_desc": "For multi-region and high-throughput systems.",
      "plan3_f1": "Custom Master Services Agreement (MSA)",
      "plan3_f2": "Custom AI LLM Dispatcher Plugins",
      "plan3_f3": "Dedicated Senior DevOps Lead",
      "plan3_f4": "Net-30 Corporate Terms",
      "plan3_btn": "Contact Sales",

      // FAQ
      "faq_tag": "Operational & B2B FAQ",
      "faq_title": "Frequently Asked Questions",
      "faq_subtitle": "Everything you need to know regarding licensing, SLA guarantees, invoicing, and technical deployment.",
      "faq_q1": "How does the contractual 99.9% uptime SLA compensation work?",
      "faq_a1": "Under our Master Services Agreement (MSA), if your cluster uptime falls below 99.9% in a calendar month, INCONTROL PLUS automatically applies contractual service credits calculated per minute of downtime, credited directly against your next Stripe invoice.",
      "faq_q2": "How are corporate EU VAT invoices and payments handled via Stripe?",
      "faq_a2": "All corporate retainers are invoiced securely through Stripe Invoicing with automated EU VAT reverse-charge calculation. We support SEPA B2B direct bank transfers, corporate cards (Visa, Mastercard, AMEX), and Net-14 payment terms.",
      "faq_q3": "How does OpenBalancer handle LLM token streams (SSE) without buffer bloat?",
      "faq_a3": "OpenBalancer streams chunks directly via zero-copy kernel socket piping and disables internal proxy response buffering for `text/event-stream` and `application/grpc` headers. Memory consumption remains strictly constant (O(1)) regardless of stream length.",
      "faq_q4": "Can we deploy OpenBalancer on-premises in isolated/air-gapped networks?",
      "faq_a4": "Yes. OpenBalancer is 100% self-contained and has zero external telemetry requirements. You can run it as a standalone Linux binary, a Docker container, or inside a Kubernetes cluster completely isolated from the public internet.",
      "faq_q5": "What is your refund and SLA cancellation policy?",
      "faq_a5": "We offer a 30-day initial trial window on SLA retainers. If our response times or failover performance do not meet your technical expectations, you can cancel with full refund of the current retainer period.",

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
      "modal_lbl_payment_method": "Preferred Billing & Payment Method",
      "modal_opt_invoice": "Corporate Net-14 Invoicing",
      "modal_opt_invoice_sub": "SEPA Bank Transfer / VAT Reverse Charge",
      "modal_opt_card": "Instant Stripe Card Checkout",
      "modal_opt_card_sub": "Corporate Credit / Debit Card & Apple Pay",
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
      "nav_matrix": "Сравнителна матрица",
      "nav_config": "Конфигуратор",
      "nav_enterprise": "Enterprise SLA",
      "nav_pricing": "Цени & Планове",
      "nav_faq": "ЧЗВ",
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

      // Simulator & Prometheus Telemetry
      "sim_tag": "Интерактивен тестов стенд",
      "sim_title": "Симулатор на трафик & отпадане на възел в реално време",
      "sim_subtitle": "Наблюдавайте как OpenBalancer динамично разпределя сокет заявките и премаршрутира трафика при отпадане на възел.",
      "sim_chart_title": "Телеметрия на трафика в реално време (Prometheus Metric Stream)",
      "sim_chart_live": "НА ЖИВО",
      "sim_processed_reqs": "Обработени заявки",
      "sim_observed_latency": "Измерена латентност",
      "sim_dispatched_node": "Маршрутизиран възел",
      "sim_btn_outage": "Срив на Node 2 (Failover)",
      "sim_btn_restore": "Възстанови Node 2",
      "sim_btn_latency": "Инжектирай 500ms латентност (Възел 1)",
      "sim_btn_surge": "Трафик пик (1k Заявки/сек)",
      "sim_btn_reset": "Рестартирай клъстера",
      "sim_btn_send": "Изпрати сокет заявка",
      "sim_event_baseline": "Статус на клъстера: Всички 3 възела са активни. Динамичното балансиране работи.",
      "sim_event_outage": "Chaos Симулация: Възел 2 прекъсна (503). Трафикът е пренасочен към Възел 1 и 3 с 0 загубени пакети.",
      "sim_event_latency": "Circuit Breaker: Засечена висока латентност на Възел 1 (520ms). Натоварването се преразпределя.",
      "sim_event_surge": "Стрес тест: 1,000 заявки/сек приети. Асинхронната опашка се обработва без забавяне.",
      "sim_event_reset": "Статус на клъстера: Всички възли са възстановени към базово състояние (12ms латентност).",
      "sim_client_ingress": "Входящ трафик",
      "sim_client_sub": "TCP Сокети & Webhooks",
      "sim_core_title": "OpenBalancer Ядро",
      "sim_core_sub": "Претеглен Round-Robin",

      // Comparison Matrix
      "matrix_tag": "Сравнителна матрица с отворен код",
      "matrix_title": "OpenBalancer спрямо традиционните Edge проксита",
      "matrix_subtitle": "Проектиран специфично за ниско-латентно асинхронно маршрутизиране на AI инференс и микросървисни клъстери.",
      "col_feature": "Функционалност / Възможност",
      "col_openbalancer": "OpenBalancer v1.4",
      "col_nginx": "NGINX Community",
      "col_haproxy": "HAProxy Community",
      "col_traefik": "Traefik Proxy",
      "m_f1": "Асинхронно неблокиращо ядро",
      "m_f2": "LLM Token Stream & SSE Passthrough",
      "m_f3": "Активен Health Probing & Circuit Breaking",
      "m_f4": "Памет в покой (RSS)",
      "m_f5": "Подмилисекундно p99 забавяне",
      "m_f6": "Гарантиран B2B 99.9% Ъптайм SLA договор",

      // Config Generator
      "cfg_tag": "Интерактивен генератор на конфигурации",
      "cfg_title": "Генератор на клъстерна конфигурация",
      "cfg_subtitle": "Настройте параметрите на вашия клъстер, теглата на възлите и проверките за здраве с валидация в реално време и сваляне с 1 клик.",
      "cfg_lbl_algo": "Алгоритъм за маршрутизиране",
      "cfg_lbl_port": "Слушащ порт",
      "cfg_lbl_probe": "Интервал на здравна проверка",
      "cfg_lbl_cb": "Праг на Circuit Breaker (грешки)",
      "cfg_lbl_timeout": "Таймаут на сокет връзка",
      "cfg_lbl_upstreams": "Конфигурирани Upstream сървъри",
      "cfg_btn_add": "+ Добави сървърен възел",
      "cfg_btn_download": "Свали openbalancer.json",
      "cfg_btn_copy": "Копирай конфигурацията",
      "cfg_copied": "Копирано!",

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
      "plan1_f1": "Пълно софтуерно маршрутизиращо ядро (MIT)",
      "plan1_f2": "Round-robin & Претеглени алгоритми",
      "plan1_f3": "Активен Health Probing & Метрики",
      "plan1_f4": "Docker Swarm & Kubernetes поддръжка",
      "plan1_btn": "Свали Community Core",
      
      "plan2_popular": "Корпоративен SLA",
      "plan2_title": "B2B Pro SLA Абонамент",
      "plan2_desc": "За високодостъпни производствени клъстери.",
      "plan2_f1": "99.9% Договорно гарантиран Ъптайм SLA",
      "plan2_f2": "Под 15 минути реакция при инцидент",
      "plan2_f3": "Защитена мулти-възлова конфигурация",
      "plan2_f4": "Официална B2B фактура през Stripe",
      "plan2_btn": "Заяви SLA Договор",
      
      "plan3_title": "Персонализиран Enterprise SLA",
      "plan3_desc": "За мулти-регионални и високочестотни системи.",
      "plan3_f1": "Индивидуален Master Services Agreement (MSA)",
      "plan3_f2": "Персонализирани AI LLM диспечер плъгини",
      "plan3_f3": "Специализиран старши DevOps архитект",
      "plan3_f4": "Net-30 Корпоративно плащане",
      "plan3_btn": "Свържи се с нас",

      // FAQ
      "faq_tag": "Оперативни & B2B ЧЗВ",
      "faq_title": "Често задавани въпроси",
      "faq_subtitle": "Всичко, което трябва да знаете относно лицензиране, SLA гаранции, фактуриране и разгръщане.",
      "faq_q1": "Как работи компенсацията при нарушение на 99.9% SLA?",
      "faq_a1": "Според нашия Master Services Agreement (MSA), ако месечният ъптайм на вашия клъстер падне под 99.9%, ИНКОНТРОЛ ПЛЮС автоматично начислява компенсаторни кредити за услуги за всяка минута престой, които се приспадат от следващата фактура в Stripe.",
      "faq_q2": "Как се издават фактурите по ДДС и корпоративните плащания през Stripe?",
      "faq_a2": "Всички корпоративни абонаменти се фактурират официално през Stripe Invoicing с автоматично изчисляване на ДДС и обратно начисляване за фирми от ЕС. Поддържат се директни банкови преводи по SEPA, фирмени карти (Visa, Mastercard, AMEX) и Net-14 условия.",
      "faq_q3": "Как OpenBalancer се справя с дълги LLM токен стриймове (SSE) без изтичане на памет?",
      "faq_a3": "OpenBalancer препраща пакетите директно през нулев сокет буфер (zero-copy socket piping) и деактивира прокси буферирането за `text/event-stream` и `application/grpc`. Консумацията на памет остава стриктно константна (O(1)) независимо от дължината на стрийма.",
      "faq_q4": "Може ли OpenBalancer да бъде разгърнат on-premise в изолирана корпоративна мрежа?",
      "faq_a4": "Да. OpenBalancer е 100% самостоятелен и не изисква изходящ интернет достъп за телеметрия. Може да се изпълнява като самостоятелен Linux бинарен файл, Docker контейнер или в Kubernetes клъстер в напълно изолирана (air-gapped) банкова или държавна среда.",
      "faq_q5": "Каква е политиката за анулиране и възстановяване на средства?",
      "faq_a5": "Предоставяме 30-дневен пробен период за корпоративни SLA абонаменти. Ако времето за реакция или техническото представяне не отговарят на договорните параметри, можете да анулирате абонамента с пълно възстановяване на сумата за текущия период.",

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
      "modal_lbl_payment_method": "Предпочитан метод за плащане и фактуриране",
      "modal_opt_invoice": "Корпоративно Net-14 фактуриране",
      "modal_opt_invoice_sub": "SEPA банков превод / Обратно начисляване на ДДС",
      "modal_opt_card": "Моментално плащане с карта през Stripe",
      "modal_opt_card_sub": "Фирмена кредитна/дебитна карта & Apple Pay",
      "modal_btn_submit": "Изпрати B2B запитване за фактуриране",
      "modal_success_title": "Запитването е регистрирано успешно",
      "modal_success_desc": "Нашият старши инфраструктурен екип в ИНКОНТРОЛ ПЛЮС ще прегледа спецификациите и ще изпрати официално B2B предложение и график за фактуриране на",

      // Cookie Banner
      "cookie_text": "<strong>GDPR Известие:</strong> OpenBalancer използва строго необходими бисквитки за маршрутизация и сигурни B2B сесии. Вижте",
      "cookie_accept": "Приеми всички",
      "cookie_dismiss": "Само необходими"
    }
  };

  let currentLang = 'en';
  try {
    const saved = localStorage.getItem('openbalancer_lang');
    if (saved && (saved === 'en' || saved === 'bg')) {
      currentLang = saved;
    }
  } catch (e) {
    console.warn('Storage access not available', e);
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    try {
      localStorage.setItem('openbalancer_lang', lang);
    } catch (e) {}

    document.documentElement.lang = lang;

    // Update switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Apply translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Apply placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });
  }

  function bindEvents() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.onclick = function (e) {
        if (e) e.preventDefault();
        const targetLang = this.getAttribute('data-lang');
        setLanguage(targetLang);
      };
    });
    setLanguage(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

  window.setLanguage = setLanguage;
  window.initLanguageSwitcher = bindEvents;
  window.openbalancer_i18n = {
    setLanguage,
    getLanguage: () => currentLang,
    translations
  };
})();
