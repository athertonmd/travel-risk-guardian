import * as React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { useSidebarState } from '@/hooks/useSidebarState';

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange: setOpenProp,
}: SidebarProviderProps) {
  const isMobile = useMobile();
  const { open, setOpen, toggleSidebar } = useSidebarState({
    defaultOpen: isMobile ? false : defaultOpen,
    setOpenProp,
  });

  const value = React.useMemo(
    () => ({
      open: openProp !== undefined ? openProp : open,
      setOpen,
      toggleSidebar,
    }),
    [open, openProp, setOpen, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}