# HangoutsNChill Database

This document describes every database table used by HangoutsNChill.

The goal is to ensure every developer understands why a table exists, what it stores, and how it relates to the rest of the platform.

---

# Authentication

Provider:
Supabase Auth

Main Identifier:
auth.users.id (UUID)

Every logged-in user has a unique UUID.

---

# Profiles

Purpose

Stores additional information about each user.

Primary Key

id (UUID)

Related To

auth.users

Example Fields

- full_name
- username
- avatar_url
- bio
- created_at

Relationship

One User → One Profile

---

# Products

Purpose

Stores every digital product listed for sale.

Primary Key

id (BIGINT)

Owner

seller_id (UUID)

Related To

Profiles

Example Fields

- title
- description
- category
- price
- image_url
- stock
- status
- delivery_type
- created_at

Relationship

One Seller → Many Products

---

# Orders

Purpose

Stores purchases made by customers.

Relationship

One User

can purchase

Many Products

Stores

- buyer_id
- product_id
- amount
- payment_status
- order_status
- created_at

---

# Wallet

Purpose

Tracks creator earnings.

Stores

- seller_id
- balance
- total_earned
- total_withdrawn

Relationship

One Seller

One Wallet

---

# Transactions

Purpose

Stores every financial movement.

Examples

- Product Purchase

- Withdrawal

- Refund

- Commission

Fields

- wallet_id
- amount
- type
- reference
- status

---

# Reviews

Purpose

Stores customer reviews.

Relationship

One Product

Many Reviews

Fields

- product_id
- reviewer_id
- rating
- comment
- created_at

---

# Wishlist

Purpose

Stores products users save for later.

Relationship

Many Users

Many Products

Fields

- user_id
- product_id
- created_at

---

# Categories

Purpose

Organizes products.

Relationship

One Category

Many Products

Fields

- name
- slug
- icon

---

# Notifications

Purpose

Stores in-app notifications.

Fields

- user_id
- title
- message
- read
- created_at

---

# AI History

Purpose

Stores every Nestuge AI generation.

Fields

- user_id
- prompt
- result
- tokens_used
- created_at

---

# Future Tables

Affiliate

Coupons

Messages

Courses

Lessons

Certificates

Communities

Creator Pages

Subscriptions

Analytics