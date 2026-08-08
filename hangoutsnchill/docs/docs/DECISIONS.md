# HangoutsNChill Decision Log

This document records important product and technical decisions made during the development of HangoutsNChill.

The goal is to preserve the reasoning behind decisions so future development remains consistent.

---

# Decision 001

**Date**

2026-08-03

**Title**

Use `seller_id` instead of `user_id` in the Products table.

**Decision**

A product belongs to the seller who listed it.

The `products` table will use `seller_id` as the ownership column.

**Reason**

The name `seller_id` clearly describes ownership and makes the database easier to understand.

**Status**

✅ Accepted

---

# Decision 002

**Date**

2026-08-03

**Title**

Adopt Supabase as the backend platform.

**Decision**

Supabase will provide authentication, PostgreSQL database, storage, and Row Level Security (RLS).

**Reason**

A single backend platform reduces complexity, accelerates development, and integrates well with Next.js.

**Status**

✅ Accepted

---

# Decision 003

**Date**

2026-08-03

**Title**

Use Google Gemini for Nestuge AI.

**Decision**

Nestuge AI will use Google's Gemini models for AI-powered product generation and future AI tools.

**Reason**

Gemini provides reliable text generation and fits the long-term AI vision of HangoutsNChill.

**Status**

✅ Accepted

---

# Decision 004

**Date**

2026-08-03

**Title**

Use Next.js App Router.

**Decision**

The project will use the App Router architecture.

**Reason**

The App Router offers modern routing, server components, and improved scalability.

**Status**

✅ Accepted

---

# Decision 005

**Date**

2026-08-03

**Title**

Documentation First

**Decision**

Every major feature will be documented before development begins.

**Reason**

Clear documentation reduces confusion, improves planning, and makes onboarding easier as the team grows.

**Status**

✅ Accepted

---

# Decision 006

**Date**

2026-08-03

**Title**

Build MVP Before Advanced Features

**Decision**

Complete the core marketplace before adding advanced AI, community, and creator features.

**Reason**

A stable and usable product is more valuable than many unfinished features.

**Status**

✅ Accepted

---

---

# Decision 007

**Date**

2026-08-03

**Title**

Think Long-Term

**Owner**

Ola Olabode (Founder)

**Decision**

HangoutsNChill will always prioritize long-term value over short-term convenience.

Every technical, product, and business decision should strengthen the platform for the future, even when it requires more effort today.

**Reason**

HangoutsNChill is not being built for the next release.

It is being built to become a trusted platform that creators, entrepreneurs, and learners can rely on for years to come.

Before making any major decision, we will ask:

> **"Will this still be the right decision five years from now?"**

If the answer is yes, we move forward.

If the answer is no, we pause, rethink, and improve the decision.

**Guiding Principles**

- Build for sustainability.
- Avoid shortcuts that create technical debt.
- Document before building.
- Choose clarity over cleverness.
- Solve root problems instead of symptoms.
- Invest in quality from the beginning.

**Expected Impact**

This decision helps ensure that HangoutsNChill remains maintainable, scalable, and trustworthy as it grows from a startup into a global platform.

**Status**

✅ Accepted

---

# Decision 008

**Date**

2026-08-03

**Title**

Build to Empower

**Owner**

Ola Olabode (Founder)

**Decision**

Every feature released on HangoutsNChill must help users learn, create, market, sell, or earn.

Features that do not clearly support this mission should not be prioritized.

**Reason**

It's easy for products to become cluttered with exciting ideas that don't serve the core mission.

By keeping our focus on empowering creators and entrepreneurs, we ensure that every improvement makes the platform more valuable rather than more complicated.

**Guiding Question**

> "How does this feature help someone succeed?"

If we cannot answer that question clearly, the feature needs to be reconsidered.

**Status**

✅ Accepted

# Founder Reflection

> "Great companies are not built by making the easiest decisions. They are built by making the right decisions consistently, even when those decisions take more time."

— Ola Olabode