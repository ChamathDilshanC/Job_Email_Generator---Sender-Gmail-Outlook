import type { PageType } from '@/components/sidebar-01/types';

export const PAGE_ROUTES: Record<PageType, string> = {
  'send-email': '/send-email',
  resume: '/your-information',
  templates: '/email-templates',
  'cover-letter': '/cover-letter',
  history: '/history',
  scheduled: '/scheduled',
  profile: '/profile',
  settings: '/settings',
  guide: '/guide',
  docs: '/documentation',
};

const ROUTE_TO_PAGE = Object.entries(PAGE_ROUTES).reduce(
  (routes, [page, route]) => {
    routes[route] = page as PageType;
    return routes;
  },
  {} as Record<string, PageType>
);

export function pageFromPathname(pathname: string): PageType {
  return ROUTE_TO_PAGE[pathname.replace(/\/+$/, '') || '/send-email'] || 'send-email';
}

export function routeForPage(page: PageType): string {
  return PAGE_ROUTES[page] || PAGE_ROUTES['send-email'];
}
