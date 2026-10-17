# Security Policy

The Relay Studio team takes security issues seriously and appreciates responsible disclosure from the community.

---

## Supported Versions

Only the latest release branch of Relay Studio receives security updates and vulnerability patches.

| Version | Supported          |
| :------ | :----------------- |
| `1.x`   | :white_check_mark: |
| `< 1.0` | :x:                |

---

## Reporting a Vulnerability

**Please do NOT disclose security vulnerabilities via public GitHub issues, discussions, or pull requests.**

If you believe you have discovered a vulnerability in Relay Studio, report it privately using one of the following methods:

1. **GitHub Private Security Advisory**: Submit a private advisory directly through GitHub under the repository's **Security** tab (`Security > Advisories > Report a vulnerability`).
2. **Email**: Send detailed information to `security@relay.studio` (or the repository maintainers).

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:
- A clear description of the vulnerability.
- Step-by-step reproduction steps or a minimal Proof of Concept (PoC).
- Potential impact and affected components (e.g. authentication, file uploads, authorization checks, API endpoints).
- Any recommended remediation steps if you have them.

---

## Response Process

1. **Acknowledgment**: We aim to acknowledge receipt of security reports within 48 hours.
2. **Investigation & Triage**: We will confirm the vulnerability and determine the severity and scope.
3. **Patch & Testing**: A fix will be developed and tested internally in a private branch.
4. **Coordinated Disclosure**: Once a patch is released, a public security advisory and release notes will credit your responsible disclosure (unless you prefer to remain anonymous).

Thank you for helping keep Relay Studio and its self-hosted installations secure!
