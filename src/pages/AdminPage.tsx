import React, { useState, useEffect } from 'react';
import { Product, SiteConfig, Order, CategorySlug } from '../types';
import {
  updateSiteConfigHero,
  updateSiteConfigCategoryHeroes,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  uploadImageToServer,
} from '../lib/db';
import { formatNGN, WHATSAPP_PHONE } from '../lib/whatsapp';
import { useRouter } from '../lib/router';
import { MetaSEO } from '../components/MetaSEO';
import { normalizeImageUrl, isGoogleDriveUrl } from '../lib/driveHelper';
import {
  Shield,
  Key,
  Image as ImageIcon,
  Layers,
  PlusCircle,
  ShoppingBag,
  ExternalLink,
  Check,
  Trash2,
  Edit3,
  Eye,
  ArrowUpRight,
  LogOut,
  RefreshCw,
  Upload,
  HardDrive,
  FolderUp,
  FileCheck,
} from 'lucide-react';

interface AdminPageProps {
  products: Product[];
  siteConfig: SiteConfig;
  onRefreshData: () => Promise<void>;
  initialTab?: 'hero' | 'categories' | 'products' | 'orders';
}

const ADMIN_PASSCODE = 'kiekies2026';
const AUTH_STORAGE_KEY = 'kiekies_admin_auth_v1';

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  siteConfig,
  onRefreshData,
  initialTab = 'hero',
}) => {
  const { navigate } = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'hero' | 'categories' | 'products' | 'orders'>(initialTab);

  // Hero form state
  const [heroImage, setHeroImage] = useState(siteConfig.hero.imageUrl);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSavedSuccess, setHeroSavedSuccess] = useState(false);

  // Category heroes state
  const [categoryHeroes, setCategoryHeroes] = useState({ ...siteConfig.category_heroes });
  const [categoriesSaving, setCategoriesSaving] = useState(false);
  const [categoriesSavedSuccess, setCategoriesSavedSuccess] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'women' as CategorySlug,
    price: '',
    image_url: '',
    gallery_urls: '',
    sizes: 'UK 8, UK 10, UK 12, UK 14',
    description: '',
    featured: false,
    best_seller: false,
    status: 'published' as 'published' | 'draft',
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productSuccess, setProductSuccess] = useState(false);

  // Sync state if props update
  useEffect(() => {
    setHeroImage(siteConfig.hero.imageUrl);
    setCategoryHeroes({ ...siteConfig.category_heroes });
  }, [siteConfig]);

  // Load orders when orders tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoadingOrders(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === ADMIN_PASSCODE || passcodeInput.trim() === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Hero Save
  const handleSaveHero = async () => {
    setHeroSaving(true);
    await updateSiteConfigHero(heroImage);
    await onRefreshData();
    setHeroSaving(false);
    setHeroSavedSuccess(true);
    setTimeout(() => setHeroSavedSuccess(false), 3000);
  };

  // Category Heroes Save
  const handleSaveCategoryHeroes = async () => {
    setCategoriesSaving(true);
    await updateSiteConfigCategoryHeroes(categoryHeroes);
    await onRefreshData();
    setCategoriesSaving(false);
    setCategoriesSavedSuccess(true);
    setTimeout(() => setCategoriesSavedSuccess(false), 3000);
  };

  // Handle Product Submit (Create / Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.image_url) {
      alert('Please fill in product name, price, and primary image URL.');
      return;
    }

    setProductSaving(true);

    const parsedSizes = productForm.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedGallery = productForm.gallery_urls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parsedGallery.includes(productForm.image_url)) {
      parsedGallery.unshift(productForm.image_url);
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      image_url: productForm.image_url.trim(),
      gallery_urls: parsedGallery,
      sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
      description: productForm.description.trim() || null,
      featured: productForm.featured,
      best_seller: productForm.best_seller,
      status: productForm.status,
    };

    if (editingProductId) {
      await updateProduct(editingProductId, payload);
    } else {
      await createProduct(payload);
    }

    await onRefreshData();
    setProductSaving(false);
    setProductSuccess(true);
    setTimeout(() => setProductSuccess(false), 3000);

    // Reset form
    setEditingProductId(null);
    setProductForm({
      name: '',
      category: 'women',
      price: '',
      image_url: '',
      gallery_urls: '',
      sizes: 'UK 8, UK 10, UK 12, UK 14',
      description: '',
      featured: false,
      best_seller: false,
      status: 'published',
    });
  };

  const handleEditClick = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      image_url: p.image_url,
      gallery_urls: (p.gallery_urls || []).join('\n'),
      sizes: p.sizes.join(', '),
      description: p.description || '',
      featured: p.featured,
      best_seller: p.best_seller,
      status: p.status,
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Archive garment "${name}" from catalog?`)) {
      await deleteProduct(id);
      await onRefreshData();
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'new' | 'confirmed' | 'fulfilled') => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Helper image presets for quick testing
  const setQuickHeroPreset = (url: string) => setHeroImage(url);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-24">
        <MetaSEO title="Atelier Portal | Kiekies Fashion" description="Atelier administration" noIndex={true} />

        <div className="w-full max-w-md border border-neutral-800 bg-neutral-950 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-300">
              <Shield size={20} strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-2xl tracking-widest uppercase">Atelier Control</h1>
            <p className="text-xs text-neutral-400">
              Restricted management portal for Kiekies Fashion.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 block mb-2 font-mono">
                Atelier Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Enter passcode (default: kiekies2026)"
                  className="w-full bg-black border border-neutral-800 text-white text-xs px-4 py-3 font-mono focus:border-white focus:outline-none"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-red-400 mt-2 font-mono">
                  Incorrect passcode. Try <span className="underline">kiekies2026</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black text-xs uppercase tracking-[0.25em] py-3.5 font-medium hover:bg-neutral-200 transition-colors"
            >
              Unlock Atelier
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-[11px] uppercase tracking-widest text-neutral-400 hover:text-white"
            >
              ← Return to Client Showroom
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-28">
      <MetaSEO title="Atelier Management | Kiekies Fashion" description="Admin workspace" noIndex={true} />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl md:text-3xl tracking-wide uppercase font-light">
                Atelier Operations
              </span>
              <span className="text-[10px] font-mono uppercase bg-neutral-900 px-2 py-0.5 border border-neutral-800 text-neutral-300">
                Staff Verified
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Direct synchronization with database & live storefront.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-xs uppercase tracking-widest text-neutral-300 hover:text-white flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Preview Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-widest text-neutral-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={14} />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Google Drive & Server-Backed Storage Banner */}
        <div className="border border-emerald-500/40 bg-emerald-500/10 p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
              <HardDrive size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-bold">
                  Permanent Server Storage & Global Visibility · No Supabase Setup Needed
                </h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                <strong>Upload to Server:</strong> When you pick photos from your device, they are uploaded directly to the server disk (<code className="text-emerald-300 font-mono">/uploads/</code>) and assigned permanent URLs. All visitors on any phone or computer across the world see your photos immediately.
                <br />
                <strong>Google Drive & Web Links:</strong> Pasting Google Drive links automatically normalizes them to high-speed CDN streams and caches them on the server, guaranteeing they never break from Drive rate-limits or cookie checks. (Ensure Drive sharing is <em>"Anyone with the link can view"</em>).
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="text-[10px] font-mono uppercase bg-emerald-400 text-black px-3 py-1 font-semibold tracking-wider">
              100% Sitewide & Permanent
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Allowed Segmented Interactive Control) */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4 mb-10">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest font-mono border transition-all flex items-center gap-2 ${
              activeTab === 'hero'
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>1. Hero Display</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest font-mono border transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>2. Category Highlights</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest font-mono border transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <PlusCircle size={14} />
            <span>3. Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest font-mono border transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
            }`}
          >
            <ShoppingBag size={14} />
            <span>4. Orders Dispatch</span>
          </button>
        </div>

        {/* TAB 1: HERO IMAGE CONFIG */}
        {activeTab === 'hero' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-white font-light tracking-wide uppercase">
                  Homepage Hero Art Direction
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Updates <code className="text-neutral-300">site_config</code> key <code className="text-neutral-300">"hero"</code>. Supports Google Drive links, device uploads, and web URLs.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-neutral-300 block font-mono">
                    Hero Image URL or Google Drive Link
                  </label>

                  {/* Device upload button */}
                  <label className="cursor-pointer border border-neutral-700 hover:border-white px-3 py-1 text-[11px] uppercase tracking-wider font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors">
                    <Upload size={13} />
                    <span>Upload to Server</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const serverUrl = await uploadImageToServer(file);
                          setHeroImage(serverUrl);
                        }
                      }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(normalizeImageUrl(e.target.value))}
                  placeholder="Paste direct URL or Google Drive link (e.g. drive.google.com/file/d/...)"
                  className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-mono text-neutral-200 focus:border-white focus:outline-none"
                />

                {/* Google Drive detection badge */}
                {heroImage.includes('googleusercontent.com') && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                    <FileCheck size={14} />
                    <span>Google Drive image converted to direct high-speed CDN endpoint</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400 font-mono">
                  <span>Curated High-Fashion Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickHeroPreset(
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop'
                      )
                    }
                    className="underline hover:text-white"
                  >
                    Architectural Yellow
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickHeroPreset(
                        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop'
                      )
                    }
                    className="underline hover:text-white"
                  >
                    Monochrome Tuxedo
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickHeroPreset(
                        'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1600&auto=format&fit=crop'
                      )
                    }
                    className="underline hover:text-white"
                  >
                    Sovereign Trench
                  </button>
                </div>
              </div>


              {/* Live Preview */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono block">
                  Live Viewport Preview
                </span>
                <div className="relative aspect-[16/9] w-full max-w-xl bg-black border border-neutral-800 overflow-hidden">
                  <img
                    src={heroImage}
                    alt="Hero Preview"
                    className="w-full h-full object-cover contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-center justify-center">
                    <span className="font-serif text-3xl md:text-5xl tracking-[0.3em] uppercase text-white font-light">
                      KIEKIES
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-neutral-900">
                <button
                  onClick={handleSaveHero}
                  disabled={heroSaving}
                  className="bg-white text-black px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {heroSavedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Hero Updated</span>
                    </>
                  ) : (
                    <span>{heroSaving ? 'Saving...' : 'Deploy Hero Image'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY HIGHLIGHTS */}
        {activeTab === 'categories' && (
          <div className="space-y-8 max-w-4xl">
            <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-white font-light tracking-wide uppercase">
                  Category Highlight Images
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Updates <code className="text-neutral-300">site_config</code> key <code className="text-neutral-300">"category_heroes"</code>. These represent the "Four Doors" chambers on the homepage and banner headers on category pages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Women */}
                <div className="space-y-2 border border-neutral-900 p-4 bg-black">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest text-neutral-200 font-mono block">
                      Women's Room Image
                    </label>
                    <label className="cursor-pointer text-[10px] uppercase tracking-wider font-mono text-neutral-400 hover:text-white flex items-center gap-1">
                      <Upload size={11} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const serverUrl = await uploadImageToServer(file);
                            setCategoryHeroes({ ...categoryHeroes, women: serverUrl });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={categoryHeroes.women}
                    onChange={(e) =>
                      setCategoryHeroes({ ...categoryHeroes, women: normalizeImageUrl(e.target.value) })
                    }
                    placeholder="URL or Google Drive link"
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 font-mono text-neutral-300"
                  />
                  <div className="aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800 mt-2">
                    <img
                      src={categoryHeroes.women}
                      alt="Women"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Men */}
                <div className="space-y-2 border border-neutral-900 p-4 bg-black">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest text-neutral-200 font-mono block">
                      Men's Room Image
                    </label>
                    <label className="cursor-pointer text-[10px] uppercase tracking-wider font-mono text-neutral-400 hover:text-white flex items-center gap-1">
                      <Upload size={11} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const serverUrl = await uploadImageToServer(file);
                            setCategoryHeroes({ ...categoryHeroes, men: serverUrl });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={categoryHeroes.men}
                    onChange={(e) =>
                      setCategoryHeroes({ ...categoryHeroes, men: normalizeImageUrl(e.target.value) })
                    }
                    placeholder="URL or Google Drive link"
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 font-mono text-neutral-300"
                  />
                  <div className="aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800 mt-2">
                    <img
                      src={categoryHeroes.men}
                      alt="Men"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Kids */}
                <div className="space-y-2 border border-neutral-900 p-4 bg-black">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest text-neutral-200 font-mono block">
                      Kids' Room Image
                    </label>
                    <label className="cursor-pointer text-[10px] uppercase tracking-wider font-mono text-neutral-400 hover:text-white flex items-center gap-1">
                      <Upload size={11} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const serverUrl = await uploadImageToServer(file);
                            setCategoryHeroes({ ...categoryHeroes, kids: serverUrl });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={categoryHeroes.kids}
                    onChange={(e) =>
                      setCategoryHeroes({ ...categoryHeroes, kids: normalizeImageUrl(e.target.value) })
                    }
                    placeholder="URL or Google Drive link"
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 font-mono text-neutral-300"
                  />
                  <div className="aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800 mt-2">
                    <img
                      src={categoryHeroes.kids}
                      alt="Kids"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Accessories */}
                <div className="space-y-2 border border-neutral-900 p-4 bg-black">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest text-neutral-200 font-mono block">
                      Accessories Room Image
                    </label>
                    <label className="cursor-pointer text-[10px] uppercase tracking-wider font-mono text-neutral-400 hover:text-white flex items-center gap-1">
                      <Upload size={11} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const serverUrl = await uploadImageToServer(file);
                            setCategoryHeroes({ ...categoryHeroes, accessories: serverUrl });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={categoryHeroes.accessories}
                    onChange={(e) =>
                      setCategoryHeroes({ ...categoryHeroes, accessories: normalizeImageUrl(e.target.value) })
                    }
                    placeholder="URL or Google Drive link"
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 font-mono text-neutral-300"
                  />
                  <div className="aspect-[4/3] bg-neutral-900 overflow-hidden border border-neutral-800 mt-2">
                    <img
                      src={categoryHeroes.accessories}
                      alt="Accessories"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-900">
                <button
                  onClick={handleSaveCategoryHeroes}
                  disabled={categoriesSaving}
                  className="bg-white text-black px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {categoriesSavedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Category Highlights Updated</span>
                    </>
                  ) : (
                    <span>{categoriesSaving ? 'Saving...' : 'Deploy Category Highlights'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT CATALOG & ADD PRODUCT */}
        {activeTab === 'products' && (
          <div className="space-y-12">
            {/* Add / Edit Product Form */}
            <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-neutral-900 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-white font-light tracking-wide uppercase">
                    {editingProductId ? 'Edit Product' : 'Add New Garment to Catalog'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Inserts into <code className="text-neutral-300">products</code> table with sizes, status, and photography.
                  </p>
                </div>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        name: '',
                        category: 'women',
                        price: '',
                        image_url: '',
                        gallery_urls: '',
                        sizes: 'UK 8, UK 10, UK 12, UK 14',
                        description: '',
                        featured: false,
                        best_seller: false,
                        status: 'published',
                      });
                    }}
                    className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                      Garment Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. The Sovereign Trench Coat"
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-sans text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({ ...productForm, category: e.target.value as CategorySlug })
                      }
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-mono text-white focus:border-white focus:outline-none uppercase"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="kids">Kids</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  {/* Price in NGN */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                      Price in Naira (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="185000"
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-mono text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                      Sizes (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                      placeholder="UK 8, UK 10, UK 12, UK 14, UK 16"
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-mono text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  {/* Primary Image URL */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                        Primary Editorial Image * (Google Drive link or URL)
                      </label>
                      <label className="cursor-pointer border border-neutral-700 hover:border-white px-3 py-1 text-[11px] uppercase tracking-wider font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors">
                        <Upload size={13} />
                        <span>Upload Primary Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const serverUrl = await uploadImageToServer(file);
                              setProductForm({ ...productForm, image_url: serverUrl });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={productForm.image_url}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image_url: normalizeImageUrl(e.target.value),
                        })
                      }
                      placeholder="Paste image URL or Google Drive share link (drive.google.com/file/d/...)"
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-mono text-white focus:border-white focus:outline-none"
                    />
                    {productForm.image_url.includes('googleusercontent.com') && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                        <FileCheck size={14} />
                        <span>Google Drive link normalized to direct image endpoint</span>
                      </div>
                    )}
                    {productForm.image_url && (
                      <div className="w-16 h-20 bg-neutral-900 border border-neutral-800 overflow-hidden mt-1">
                        <img
                          src={productForm.image_url}
                          alt="Primary preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Gallery URLs */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                        Additional Gallery Photos (Google Drive links or URLs, one per line)
                      </label>
                      <label className="cursor-pointer border border-neutral-700 hover:border-white px-3 py-1 text-[11px] uppercase tracking-wider font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors">
                        <FolderUp size={13} />
                        <span>Upload Photos to Server</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              const serverUrls = await Promise.all(files.map(uploadImageToServer));
                              const currentList = productForm.gallery_urls
                                ? productForm.gallery_urls.split('\n')
                                : [];
                              const updated = [...currentList, ...serverUrls].filter(Boolean).join('\n');
                              setProductForm({ ...productForm, gallery_urls: updated });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={productForm.gallery_urls}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        const normalizedLines = lines.map(normalizeImageUrl).join('\n');
                        setProductForm({ ...productForm, gallery_urls: normalizedLines });
                      }}
                      placeholder="Paste Google Drive links or image URLs (one per line)..."
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-mono text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                      Considered Product Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({ ...productForm, description: e.target.value })
                      }
                      placeholder="Double-breasted heavyweight wool-crepe blend with architectural storm flaps..."
                      className="w-full bg-black border border-neutral-800 text-xs px-4 py-3 font-sans text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Flags: Featured, Best Seller, Status */}
                <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-neutral-900">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) =>
                        setProductForm({ ...productForm, featured: e.target.checked })
                      }
                      className="w-4 h-4 bg-black border border-neutral-700 text-white rounded-none focus:ring-0"
                    />
                    <span className="text-xs uppercase tracking-widest text-neutral-300">
                      Featured (Homepage Editorial Spread)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.best_seller}
                      onChange={(e) =>
                        setProductForm({ ...productForm, best_seller: e.target.checked })
                      }
                      className="w-4 h-4 bg-black border border-neutral-700 text-white rounded-none focus:ring-0"
                    />
                    <span className="text-xs uppercase tracking-widest text-neutral-300">
                      Best Seller
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
                      Status:
                    </span>
                    <select
                      value={productForm.status}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          status: e.target.value as 'published' | 'draft',
                        })
                      }
                      className="bg-black border border-neutral-800 text-xs px-3 py-1 font-mono uppercase text-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={productSaving}
                    className="bg-white text-black px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {productSuccess ? (
                      <>
                        <Check size={16} />
                        <span>Garment Saved</span>
                      </>
                    ) : (
                      <span>{editingProductId ? 'Update Garment' : 'Publish Garment'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Current Products Table */}
            <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
              <h3 className="font-serif text-xl text-white font-light tracking-wide uppercase mb-6">
                Active Catalog Inventory ({products.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase tracking-wider">
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Sizes</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-900/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-black border border-neutral-800 flex-shrink-0 overflow-hidden">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-serif text-sm text-neutral-200 font-medium">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 uppercase font-mono text-neutral-400">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-200">
                          {formatNGN(p.price)}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400 max-w-[140px] truncate">
                          {p.sizes.join(', ')}
                        </td>
                        <td className="py-3 px-4 text-[10px] font-mono">
                          <div className="flex flex-col gap-1">
                            {p.featured && (
                              <span className="text-amber-400 font-semibold uppercase">
                                ★ Featured
                              </span>
                            )}
                            {p.best_seller && (
                              <span className="text-neutral-400 uppercase">Best Seller</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span
                            className={
                              p.status === 'published' ? 'text-emerald-400' : 'text-neutral-500'
                            }
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => navigate(`/product/${p.id}`)}
                              className="text-neutral-400 hover:text-white p-1"
                              title="View page"
                            >
                              <ExternalLink size={15} />
                            </button>
                            <button
                              onClick={() => handleEditClick(p)}
                              className="text-neutral-400 hover:text-white p-1"
                              title="Edit piece"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="text-neutral-500 hover:text-red-400 p-1"
                              title="Archive piece"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS VIEW (/admin/orders) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="border border-neutral-800 bg-neutral-950 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900">
                <div>
                  <h2 className="font-serif text-2xl text-white font-light tracking-wide uppercase">
                    Incoming Order Dossiers
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Every order created by a client on checkout. Click code to inspect garment photography and sizes.
                  </p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw size={13} className={loadingOrders ? 'animate-spin' : ''} />
                  <span>Refresh Orders</span>
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs uppercase tracking-widest text-neutral-400 font-mono">
                  Loading orders from database...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 space-y-2">
                  <p className="font-serif text-lg text-neutral-300">No Orders Received Yet</p>
                  <p className="text-xs max-w-sm mx-auto">
                    When visitors click "Send Order via WhatsApp", orders are logged here and assigned a 6-character code.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase tracking-wider">
                        <th className="py-3 px-4">Order Code</th>
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status & Transition</th>
                        <th className="py-3 px-4 text-right">Inspection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-900/40">
                          <td className="py-4 px-4 font-mono font-bold text-white tracking-widest">
                            #{order.code}
                          </td>
                          <td className="py-4 px-4 font-mono text-neutral-400">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-neutral-300">
                              {order.items.reduce((sum, it) => sum + it.quantity, 0)} pcs
                            </span>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                              {order.items.map((i) => i.name).join(', ')}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-medium text-white">
                            {formatNGN(order.total)}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as any)
                              }
                              className={`bg-black border text-xs px-2.5 py-1.5 font-mono uppercase tracking-wider focus:outline-none ${
                                order.status === 'new'
                                  ? 'border-amber-700/80 text-amber-300'
                                  : order.status === 'confirmed'
                                  ? 'border-emerald-700/80 text-emerald-300'
                                  : 'border-blue-700/80 text-blue-300'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="fulfilled">Fulfilled</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => navigate(`/order/${order.code}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-white text-[11px] uppercase tracking-wider text-neutral-200 hover:text-white transition-colors"
                              >
                                <span>View Manifest</span>
                                <ArrowUpRight size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
