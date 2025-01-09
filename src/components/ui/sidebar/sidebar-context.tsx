import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarState } from '@/hooks/useSidebarState';

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  state: "open" | "collapsed";
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
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
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const { open, setOpen, toggleSidebar } = useSidebarState({
    defaultOpen: isMobile ? false : defaultOpen,
    setOpenProp,
  });

  const state: "open" | "collapsed" = open ? "open" : "collapsed";

  const value = React.useMemo(
    () => ({
      open: openProp !== undefined ? openProp : open,
      setOpen,
      toggleSidebar,
      isMobile,
      state,
      openMobile,
      setOpenMobile,
    }),
    [open, openProp, setOpen, toggleSidebar, isMobile, state, openMobile]
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