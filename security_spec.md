# Security Specification — Kiekies Fashion Atelier

## 1. Data Invariants
1. **Default Deny**: All paths not explicitly matched (`/{document=**}`) deny all read and write access (`allow read, write: if false;`).
2. **Product Integrity**: Every `/products/{productId}` document must pass `isValidProduct(incoming())` on create and update, enforcing allowed keys, string lengths (`name <= 200`, `image_url <= 900000`, `description <= 5000`), bounded arrays (`gallery_urls.size() <= 10`, `sizes.size() <= 15`), valid category enum (`['women', 'men', 'kids', 'accessories']`), and immutable `id` / `created_at` on updates.
3. **Site Config Integrity**: Every `/site_config/{configKey}` document must have `configKey in ['hero', 'category_heroes']` and strictly conform to `isValidSiteConfig(incoming(), configKey)` with bounded image URL strings (`<= 900000`).
4. **Order Integrity & Terminal State Locking**: Every `/orders/{orderId}` document must pass `isValidOrder(incoming(), orderId)` with `orderId == incoming().code`, `status in ['new', 'confirmed', 'fulfilled']`, bounded `items.size() <= 20`, and terminal state locking once `existing().status == 'fulfilled'` (unless overridden by `isAdmin()`).
5. **Verified Admin & Passcode/Auth Boundary**: Admin privileges (`isAdmin()`) require `isSignedIn() && request.auth.token.email_verified == true && (request.auth.token.email == 'vroommaybach@gmail.com' || exists(/databases/$(database)/documents/admins/$(request.auth.uid)))`.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on Product Create**: `{ "id": "prod-1", "name": "Gown", "category": "women", "price": 100000, "image_url": "https://example.com/a.jpg", "gallery_urls": ["https://example.com/a.jpg"], "sizes": ["UK 8"], "featured": false, "best_seller": false, "status": "published", "created_at": "2026-10-05T00:00:00Z", "isAdminBypass": true }` -> Rejected by `hasOnly()`.
2. **Unverified Email Spoofing on Admin Write**: Auth token `{ email: "vroommaybach@gmail.com", email_verified: false }` attempting to delete `/products/prod-1` -> Rejected by `email_verified == true`.
3. **ID Poisoning / Oversized Document ID**: Creating `/products/a_1500_char_id_string...` -> Rejected by `isValidId(productId)`.
4. **Invalid Category Enum on Product**: `{ "category": "footwear" }` -> Rejected by `data.category in ['women', 'men', 'kids', 'accessories']`.
5. **Negative Price Injection on Product**: `{ "price": -5000 }` -> Rejected by `data.price is number && data.price >= 0`.
6. **Unbounded Gallery Array DoS**: `gallery_urls` containing 25 strings -> Rejected by `data.gallery_urls.size() <= 10`.
7. **Immortal Field Mutation (`created_at`) on Product Update**: Updating `created_at` on `/products/prod-1` -> Rejected by `incoming().created_at == existing().created_at`.
8. **Invalid SiteConfig Key**: Writing to `/site_config/arbitrary_key` -> Rejected by `configKey in ['hero', 'category_heroes']`.
9. **Order Code Mismatch**: Creating `/orders/ABC234` with `{ "code": "XYZ987" }` -> Rejected by `data.code == orderId`.
10. **Order Terminal State Mutation**: Non-admin attempting to update `/orders/ABC234` when `existing().status == 'fulfilled'` -> Rejected by terminal state lock.
11. **Order Unauthorized Field Update**: Attempting to modify `total` on an existing `/orders/ABC234` during status update -> Rejected by `affectedKeys().hasOnly(['status'])`.
12. **Self-Assigned Admin Record**: Non-admin attempting to create `/admins/attacker_uid` with `{ "uid": "attacker_uid", "role": "admin" }` -> Rejected by `allow create: if isAdmin()`.
