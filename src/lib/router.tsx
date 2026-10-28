import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

function getInitialLocationPath(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Check if a hash route is present (e.g. #/product/prod-001)
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const hashPath = window.location.hash.slice(1);
    return hashPath || '/';
  }

  // 2. Check query parameter fallback (?p=/product/prod-001)
  const params = new URLSearchParams(window.location.search);
  const queryRoute = params.get('p');
  if (queryRoute && queryRoute.startsWith('/')) {
    return queryRoute;
  }

  // 3. Standard pathname (strip any trailing /index.html or trailing slash)
  const rawPathname = (window.location.pathname || '/')
    .replace(/\/index\.html$/i, '')
    .replace(/\/+$/, '');

  return rawPathname || '/';
}

const RouterContext = createContext<RouterContextType>({
  path: getInitialLocationPath(),
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => getInitialLocationPath());

  useEffect(() => {
    const syncPathFromLocation = () => {
      setPath(getInitialLocationPath());
    };

    window.addEventListener('popstate', syncPathFromLocation);
    window.addEventListener('hashchange', syncPathFromLocation);
    return () => {
      window.removeEventListener('popstate', syncPathFromLocation);
      window.removeEventListener('hashchange', syncPathFromLocation);
    };
  }, []);

  const navigate = (to: string) => {
    const cleanTarget = to.startsWith('/') ? to : `/${to}`;
    if (cleanTarget === path) return;

    try {
      window.history.pushState({}, '', cleanTarget);
    } catch {
      window.location.hash = `#${cleanTarget}`;
    }

    setPath(cleanTarget);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export interface ParsedRoute {
  name: 'home' | 'category' | 'product' | 'order' | 'admin' | 'admin_orders' | 'cart' | 'not_found';
  param?: string;
}

export function parseRoute(pathname: string): ParsedRoute {
  const clean = pathname
    .replace(/^#/, '')
    .replace(/\/index\.html$/i, '')
    .replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '') {
    return { name: 'home' };
  }
  if (clean === '/cart') {
    return { name: 'cart' };
  }
  if (clean === '/admin') {
    return { name: 'admin' };
  }
  if (clean === '/admin/orders') {
    return { name: 'admin_orders' };
  }

  // Support both /category/women and direct /women shortcuts
  if (['women', 'men', 'kids', 'accessories', 'all'].includes(clean.slice(1).toLowerCase())) {
    return { name: 'category', param: clean.slice(1).toLowerCase() };
  }

  const categoryMatch = clean.match(/^\/category\/([^/]+)$/i);
  if (categoryMatch) {
    return { name: 'category', param: categoryMatch[1].toLowerCase() };
  }

  const productMatch = clean.match(/^\/product\/([^/]+)$/i);
  if (productMatch) {
    return { name: 'product', param: decodeURIComponent(productMatch[1]) };
  }

  const orderMatch = clean.match(/^\/order\/([^/]+)$/i);
  if (orderMatch) {
    return { name: 'order', param: decodeURIComponent(orderMatch[1]).toUpperCase() };
  }

  return { name: 'not_found' };
}
