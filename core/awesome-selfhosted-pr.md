# Pull Request Submission for `awesome-selfhosted/awesome-selfhosted`

**Repository:** `awesome-selfhosted/awesome-selfhosted`  
**Target File:** `README.md`  
**Section:** `### Proxy` (under `## Software`)  
**Alphabetical Placement:** Between `Oathkeeper` / `Nginx...` and `Pomerium` / `Pound` / `Privoxy`

---

## 1. Markdown Entry to Add to `README.md`

```markdown
* [OpenBalancer](https://www.openbalancer.com) - Lightweight asynchronous reverse proxy and load balancer with live telemetry and SSE streaming support for AI inference and microservices. ([Source Code](https://github.com/incontrolplus/openbalancer)) `MIT` `Python/Docker`
```

---

## 2. Official PR Title & Description Template

### **PR Title:**
```
Add OpenBalancer to Proxy section
```

### **PR Body:**
```markdown
### Summary
This PR adds **OpenBalancer** to the **Proxy** section.

- **Name:** OpenBalancer
- **Website:** https://www.openbalancer.com
- **Source Code:** https://github.com/incontrolplus/openbalancer
- **License:** MIT (OSI-Approved)
- **Primary Language / Platform:** Python, Docker
- **Docker Image:** `ghcr.io/incontrolplus/openbalancer:latest`
- **Description:** Lightweight asynchronous reverse proxy and load balancer with live telemetry and SSE streaming support for AI inference and microservices.

### Checklist
- [x] Item is open-source (MIT License).
- [x] Item is self-hostable with clear deployment instructions (Docker, PyPI, CLI).
- [x] Placed strictly in alphabetical order within the `### Proxy` section.
- [x] Description is objective, concise, and avoids marketing buzzwords.
- [x] Description begins with a capital letter and ends with a period.
- [x] Proper tag formatting used: `` `MIT` `Python/Docker` ``.
- [x] Links to active official website and open-source GitHub repository.
```

---

## 3. GitHub CLI Submission Command (Optional)

```bash
# If submitting via GitHub CLI from a forked awesome-selfhosted repository:
gh pr create \
  --repo awesome-selfhosted/awesome-selfhosted \
  --title "Add OpenBalancer to Proxy section" \
  --body-file core/awesome-selfhosted-pr.md \
  --base master \
  --head <your-username>:add-openbalancer
```

