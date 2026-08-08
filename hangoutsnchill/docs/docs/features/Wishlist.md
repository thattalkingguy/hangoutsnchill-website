# Wishlist Feature

## Goal

Allow users to save products for future purchase.

---

## User Story

As a customer,

I want to save products I like,

so I can purchase them later.

---

## Features

- Add product
- Remove product
- View wishlist
- Prevent duplicates

---

## Permissions

Only authenticated users can use Wishlist.

---

## Database

Table:

wishlist

Columns

- id
- user_id
- product_id
- created_at

---

## API

POST /api/wishlist

GET /api/wishlist

DELETE /api/wishlist/:id

---

## Pages

Marketplace

Product Page

My Wishlist

---

## Success Criteria

✅ User can save product

✅ User can remove product

✅ User sees saved products

✅ Duplicate saves are prevented