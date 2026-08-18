# awesome-selfhosted Submission Guide & PR Draft

> **Important Submission Requirement**:
> The `awesome-selfhosted` project has transitioned away from monolithic `README.md` edits. All additions are submitted as structured YAML files to the **[awesome-selfhosted/awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data)** repository.

---

## 1. Submission Overview & Constraints

- **Target Repository:** `awesome-selfhosted/awesome-selfhosted-data`
- **Target File Path:** `software/openbalancer.yml`
- **Category Tag:** `Web Servers`  
  *(Note: The `Proxy` category is strictly for forward proxies; reverse proxies and load balancers belong in `Web Servers`)*.
- **Minimum Project Age Requirement:** Projects must be at least **4 months old** before submission. With OpenBalancer released in August 2026, the earliest permissible submission window is **December 2026**.

---

## 2. Corrected YAML Specification (`software/openbalancer.yml`)

The file `software/openbalancer.yml` in `awesome-selfhosted-data` must contain the following YAML definition:

```yaml
name: "OpenBalancer"
website_url: "https://openbalancer.com"
source_code_url: "https://github.com/incontrolplus/openbalancer"
description: "Asynchronous reverse proxy and load balancer with health checks, circuit breaker, multiple balancing strategies, and a Prometheus metrics endpoint."
licenses:
  - MIT
platforms:
  - Python
  - Docker
tags:
  - Web Servers
```

---

## 3. Pull Request Submission Template

### **PR Title:**
```text
Add OpenBalancer
```

### **PR Description:**
```markdown
### Summary
Adds OpenBalancer entry to `software/openbalancer.yml` under the `Web Servers` tag.

- **Name:** OpenBalancer
- **Website:** https://openbalancer.com
- **Source Code:** https://github.com/incontrolplus/openbalancer
- **License:** MIT
- **Platforms:** Python, Docker
- **Tags:** Web Servers
- **Description:** Asynchronous reverse proxy and load balancer with health checks, circuit breaker, multiple balancing strategies, and a Prometheus metrics endpoint.

### Verification Checklist
- [x] Submitted to `awesome-selfhosted/awesome-selfhosted-data` (not the main README repo).
- [x] File placed at `software/openbalancer.yml` adhering to the required YAML schema.
- [x] Assigned to `Web Servers` tag (reverse proxy / load balancer).
- [x] Description is neutral, technical, non-marketing, and under 250 characters (146 characters).
- [x] Repository meets the 4-month minimum age criteria (submission >= December 2026).
- [x] Project is open-source (MIT License) and self-hostable.
```

---

## 4. Execution Workflow (GitHub CLI)

When the repository satisfies the 4-month age threshold in December 2026:

```bash
# 1. Fork and clone the dataset repository
gh repo fork awesome-selfhosted/awesome-selfhosted-data --clone
cd awesome-selfhosted-data

# 2. Create feature branch
git checkout -b add-openbalancer

# 3. Create the software definition file
cat <<'EOF' > software/openbalancer.yml
name: "OpenBalancer"
website_url: "https://openbalancer.com"
source_code_url: "https://github.com/incontrolplus/openbalancer"
description: "Asynchronous reverse proxy and load balancer with health checks, circuit breaker, multiple balancing strategies, and a Prometheus metrics endpoint."
licenses:
  - MIT
platforms:
  - Python
  - Docker
tags:
  - Web Servers
EOF

# 4. Commit and push
git add software/openbalancer.yml
git commit -m "Add OpenBalancer"
git push origin add-openbalancer

# 5. Submit PR
gh pr create \
  --repo awesome-selfhosted/awesome-selfhosted-data \
  --title "Add OpenBalancer" \
  --body "Adds OpenBalancer to software/openbalancer.yml under Web Servers." \
  --base master \
  --head <your-github-username>:add-openbalancer
```
