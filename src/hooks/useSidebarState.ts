import { useState, useCallback, useEffect } from 'react';
import { getSidebarState, setSidebarState } from '@/utils/cookies';

interface UseSidebarStateProps {
  defaultOpen: boolean;
  setOpenProp?: (open: boolean) => void;
}

export const useSidebarState = ({ defaultOpen, setOpenProp }: UseSidebarStateProps) => {
  const [open, _setOpen] = useState(() => {
    const savedState = getSidebarState();
    return savedState !== null ? savedState : defaultOpen;
  });

  useEffect(() => {
    // Initialize with defaultOpen if no saved state
    if (getSidebarState() === null) {
      _setOpen(defaultOpen);
    }
  }, [defaultOpen]);

  const setOpen = useCallback(
    (openState: boolean) => {
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      setSidebarState(openState);
    },
    [setOpenProp]
  );

  const toggleSidebar = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return {
    open,
    setOpen,
    toggleSidebar,
  };
};