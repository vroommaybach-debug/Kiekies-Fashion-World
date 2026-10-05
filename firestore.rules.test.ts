/**
 * Dirty Dozen Security Specification Verification Suite
 * Validates all 12 adversarial payloads defined in security_spec.md
 */

export interface SecurityPayloadTestCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityPayloadTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Product Create',
    collection: '/products/prod-1',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      id: 'prod-1',
      name: 'Gown',
      category: 'women',
      price: 100000,
      image_url: 'https://example.com/a.jpg',
      gallery_urls: ['https://example.com/a.jpg'],
      sizes: ['UK 8'],
      featured: false,
      best_seller: false,
      status: 'published',
      created_at: '2026-10-05T00:00:00Z',
      isAdminBypass: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoofing on Admin Delete',
    collection: '/products/prod-1',
    operation: 'delete',
    auth: { uid: 'spoof-1', email: 'vroommaybach@gmail.com', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'ID Poisoning / Oversized Document ID',
    collection: `/products/${'a'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Invalid Category Enum on Product',
    collection: '/products/prod-2',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      id: 'prod-2',
      name: 'Boots',
      category: 'footwear',
      price: 90000,
      image_url: 'https://example.com/b.jpg',
      gallery_urls: ['https://example.com/b.jpg'],
      sizes: ['40'],
      featured: false,
      best_seller: false,
      status: 'published',
      created_at: '2026-10-05T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Negative Price Injection on Product',
    collection: '/products/prod-3',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      id: 'prod-3',
      name: 'Dress',
      category: 'women',
      price: -5000,
      image_url: 'https://example.com/c.jpg',
      gallery_urls: ['https://example.com/c.jpg'],
      sizes: ['UK 10'],
      featured: false,
      best_seller: false,
      status: 'published',
      created_at: '2026-10-05T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Unbounded Gallery Array DoS',
    collection: '/products/prod-4',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      id: 'prod-4',
      name: 'Dress',
      category: 'women',
      price: 150000,
      image_url: 'https://example.com/c.jpg',
      gallery_urls: new Array(25).fill('https://example.com/c.jpg'),
      sizes: ['UK 10'],
      featured: false,
      best_seller: false,
      status: 'published',
      created_at: '2026-10-05T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immortal Field Mutation (created_at) on Product Update',
    collection: '/products/prod-1',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      created_at: '2099-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Invalid SiteConfig Key',
    collection: '/site_config/arbitrary_key',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      key: 'arbitrary_key',
      updated_at: '2026-10-05T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Order Code Mismatch',
    collection: '/orders/ABC234',
    operation: 'create',
    auth: null,
    payload: {
      id: 'ABC234',
      code: 'XYZ987',
      items: [],
      total: 100000,
      status: 'new',
      created_at: '2026-10-05T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Order Terminal State Mutation on Fulfilled Order',
    collection: '/orders/ABC234',
    operation: 'update',
    auth: null,
    payload: {
      status: 'new',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Order Unauthorized Field Update (total)',
    collection: '/orders/ABC234',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'vroommaybach@gmail.com', email_verified: true },
    payload: {
      total: 0,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Record',
    collection: '/admins/attacker_uid',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      uid: 'attacker_uid',
      role: 'admin',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
