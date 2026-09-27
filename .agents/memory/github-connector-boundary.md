---
name: GitHub connector boundary
description: Forge server-side GitHub operations use the Replit-managed connector proxy, not client credentials or direct token handling.
---

Forge's GitHub repository and Actions controls must stay behind the authenticated Replit connector proxy. The mobile client calls Forge's API; it never receives or stores GitHub credentials.

**Why:** The authorized connection supplies token refresh and the required repository permissions, while keeping write access out of the device.

**How to apply:** For future GitHub features, add a validated API route backed by the connector SDK, expose only the needed operation to the mobile client, and surface provider errors instead of silently falling back.