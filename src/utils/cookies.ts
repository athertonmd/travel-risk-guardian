const SIDEBAR_COOKIE_NAME = 'sidebar-open';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
};

export const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
};

export const getSidebarState = (): boolean | null => {
  const value = getCookie(SIDEBAR_COOKIE_NAME);
  return value ? value === 'true' : null;
};

export const setSidebarState = (isOpen: boolean) => {
  setCookie(SIDEBAR_COOKIE_NAME, String(isOpen), SIDEBAR_COOKIE_MAX_AGE);
};