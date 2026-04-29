"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHash(behavior: ScrollBehavior) {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!hash) {
    return;
  }

  const target = document.getElementById(hash);
  if (!target) {
    return;
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior, block: "start" });
  });
}

export function HashScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    const handleHashChange = () => scrollToHash("smooth");

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToHash("smooth");
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
