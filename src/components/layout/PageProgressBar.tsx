'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When pathname or searchParams change, complete the progress bar
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on internal links to start progress bar smoothly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');
      const download = target.getAttribute('download');

      // Ignore external, download, blank target, or hash-only links
      if (
        !href ||
        targetAttr === '_blank' ||
        download !== null ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      // Check if it's an internal route that is different from current page
      try {
        const url = new URL(href, window.location.origin);
        const currentUrl = new URL(window.location.href);

        if (url.origin === currentUrl.origin) {
          const isSamePage =
            url.pathname === currentUrl.pathname && url.search === currentUrl.search;
          if (!isSamePage) {
            setVisible(true);
            setProgress(25);

            // Staged incremental progression while waiting
            setTimeout(() => setProgress((p) => (p < 70 ? 70 : p)), 100);
            setTimeout(() => setProgress((p) => (p < 88 ? 88 : p)), 250);
          }
        }
      } catch {
        // invalid URL, ignore
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-pantas-primary transition-all duration-300 ease-out shadow-[0_0_8px_#0D6548]"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
