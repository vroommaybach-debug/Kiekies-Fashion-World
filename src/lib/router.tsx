import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname || '/',
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(to);
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
  const clean = pathname.replace(/\/+$/, '') || '/';

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

  const categoryMatch = clean.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    return { name: 'category', param: categoryMatch[1].toLowerCase() };
  }

  const productMatch = clean.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    return { name: 'product', param: productMatch[1] };
  }

  const orderMatch = clean.match(/^\/order\/([^/]+)$/);
  if (orderMatch) {
    return { name: 'order', param: orderMatch[1].toUpperCase() };
  }

  return { name: 'not_found' };
}
