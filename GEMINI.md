# /goal Command Rule

> **CRITICAL INSTRUCTION**: Whenever the user begins a message with `/goal` or `Цел:`, you must immediately act as a strategic advisor and propose S.M.A.R.T. (Specific, Measurable, Achievable, Relevant, Time-bound) and "most valuable next steps" (MVNS) towards achieving that objective. After proposing the steps, you MUST automatically proceed to execute them (creating files, calling APIs, etc.) without waiting for manual user confirmation. Do not ask for permission to start.

When executing a `/goal`, structure your response in Bulgarian as follows:
1. **🎯 Основна цел (Objective):** Ясно дефиниране на целта.
2. **✅ S.M.A.R.T. Критерии:** Кратка обосновка как планът отговаря на Specific, Measurable, Achievable, Relevant, Time-bound.
3. **🚀 Най-ценни следващи стъпки (Most Valuable Next Steps):** Приоритетен списък с конкретни действия, започвайки от най-важното.
4. **⚡ Автоматично Изпълнение:** Изпълни плана автоматично и информирай потребителя за резултата (какво е създадено/логнато), вместо да искаш ръчно потвърждение за старт.

---

# Multi-Node Storage Transfer & Concurrency Guardrails

1. **Mandatory Script Mutex / Lockfile**: Every scheduled backup or file sync script running via cron/watchdog MUST include a PID lockfile check (`LOCKFILE="/tmp/<name>.lock"`) with exit traps (`trap 'rm -f "$LOCKFILE"' EXIT INT TERM`) to prevent stacked duplicate processes.
2. **Resilient Large File Transfers**: Large data transfers (>5GB, VM images `.qcow2`, database dumps) across hosts MUST use `rsync` with `--inplace --partial` and keep-alive SSH flags (`ServerAliveInterval=15 ServerAliveCountMax=6`) within an auto-retry loop.
3. **Exact Progress Calculation**: Always calculate real transfer progress by comparing exact byte counts from source and destination using `stat -f %z` instead of estimations.
4. **Targeted Non-Blocking Disk Diagnostics**: Avoid broad recursive `find` scans across external USB drives (`/Volumes/PHILIPS_SSD`) during active transfers; utilize `stat -f`, `lsof -p`, `ps aux`, and direct directory inspections to prevent I/O bottlenecks.
