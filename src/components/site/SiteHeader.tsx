"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FolderOpen,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  X,
} from "lucide-react";
import SiteLogo from "@/components/site/SiteLogo";
import {
  aboutNavLinks,
  business,
  serviceMenuGroups,
  utilityNavLinks,
  whyUsNavLinks,
} from "@/lib/site/config";

type OpenMenu = "services" | "why-us" | "about" | null;

const utilityIcons = {
  "Service Areas": MapPin,
  Reviews: MessageSquare,
  Projects: FolderOpen,
} as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileSection, setMobileSection] = useState<OpenMenu>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((current) => {
        if (!current && y > 48) return true;
        if (current && y < 8) return false;
        return current;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenus = useCallback(() => {
    setOpenMenu(null);
    setMenuOpen(false);
    setMobileSection(null);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMenus]);

  function toggleMenu(menu: OpenMenu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function navLinkClass(active: boolean) {
    return active
      ? "flex items-center gap-1 rounded-lg bg-site-nav-cta px-4 py-2.5 text-[15px] font-medium text-white"
      : "flex items-center gap-1 rounded-lg px-4 py-2.5 text-[15px] font-medium text-site-text transition-colors hover:bg-site-nav-hover";
  }

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="h-0.5 bg-brand-red" aria-hidden />
      {/* Top utility bar — collapses on scroll (hysteresis prevents jitter near top) */}
      <div
        className={`overflow-hidden border-b border-solid bg-white transition-[height,border-color] duration-300 ease-in-out ${
          scrolled ? "h-0 border-transparent" : "h-11 border-gray-100"
        }`}
      >
        <div className="site-container flex h-11 items-center justify-between gap-4 text-[13px] font-medium text-site-text-muted">
          <a
            href={business.phoneHref}
            className="flex items-center gap-2 transition-colors hover:text-site-text-dark"
          >
            <Phone size={15} strokeWidth={2} aria-hidden className="text-site-accent" />
            {business.phone}
          </a>
          <nav aria-label="Utility navigation" className="hidden items-center gap-6 lg:gap-8 sm:flex">
            {utilityNavLinks.map((item) => {
              const Icon = utilityIcons[item.label];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 transition-colors hover:text-site-text-dark"
                >
                  <Icon size={15} strokeWidth={2} aria-hidden className="text-site-accent" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main navigation */}
      <div className="relative border-b border-solid border-gray-100">
        <div className="site-container flex items-center justify-between gap-6 py-3 lg:min-h-16 lg:py-0">
          <SiteLogo />

          <div className="flex items-center gap-3 lg:gap-4">
            <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex">
              <Link href="/" className={navLinkClass(pathname === "/")}>
                Home
              </Link>

              <button
                type="button"
                className={navLinkClass(openMenu === "services")}
                aria-expanded={openMenu === "services"}
                onClick={() => toggleMenu("services")}
              >
                Services
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={`transition-transform ${openMenu === "services" ? "rotate-180" : ""}`}
                />
              </button>

              <div className="relative">
                <button
                  type="button"
                  className={navLinkClass(openMenu === "why-us")}
                  aria-expanded={openMenu === "why-us"}
                  onClick={() => toggleMenu("why-us")}
                >
                  Why Us
                  <ChevronDown
                    size={15}
                    aria-hidden
                    className={`transition-transform ${openMenu === "why-us" ? "rotate-180" : ""}`}
                  />
                </button>

                {openMenu === "why-us" && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-72 border border-solid border-gray-100 bg-white py-2 shadow-lg">
                    <ul>
                      {whyUsNavLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block px-5 py-2.5 text-sm font-medium text-site-text transition-colors hover:bg-site-nav-hover hover:text-site-text-dark"
                            onClick={closeMenus}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  className={navLinkClass(openMenu === "about")}
                  aria-expanded={openMenu === "about"}
                  onClick={() => toggleMenu("about")}
                >
                  About Our Company
                  <ChevronDown
                    size={15}
                    aria-hidden
                    className={`transition-transform ${openMenu === "about" ? "rotate-180" : ""}`}
                  />
                </button>

                {openMenu === "about" && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-64 border border-solid border-gray-100 bg-white py-2 shadow-lg">
                    <ul>
                      {aboutNavLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block px-5 py-2.5 text-sm font-medium text-site-text transition-colors hover:bg-site-nav-hover hover:text-site-text-dark"
                            onClick={closeMenus}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </nav>

            <Link
              href="/#estimate"
              className="hidden items-center gap-2 rounded-lg bg-site-nav-cta px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-navy-light sm:inline-flex"
            >
              <ClipboardCheck size={17} strokeWidth={2} aria-hidden />
              Get A Free Quote
            </Link>
            <button
              type="button"
              className="p-2 text-site-text-dark lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={26} aria-hidden /> : <Menu size={26} aria-hidden />}
            </button>
          </div>
        </div>

        {/* Services mega menu */}
        {openMenu === "services" && (
          <div className="absolute inset-x-0 top-full z-50 hidden border-t border-solid border-gray-100 bg-white shadow-lg lg:block">
            <div className="site-container grid gap-8 py-8 lg:grid-cols-3">
              {serviceMenuGroups.map((group) => (
                  <div key={group.title}>
                    <div>
                        <Link
                          href={group.href}
                          className="text-base font-semibold text-site-nav-cta hover:text-brand-navy"
                          onClick={closeMenus}
                        >
                          {group.title}
                        </Link>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                          {group.description}
                        </p>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="group flex items-center gap-1 text-sm font-medium text-site-nav-cta hover:text-brand-navy"
                            onClick={closeMenus}
                          >
                            {link.label}
                            <ChevronRight
                              size={14}
                              aria-hidden
                              className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-solid border-gray-100 bg-white lg:hidden"
        >
          <ul className="px-4 py-2">
            <li>
              <Link
                href="/"
                className="block border-b border-solid border-gray-100 py-3 font-medium text-site-text"
                onClick={closeMenus}
              >
                Home
              </Link>
            </li>

            {(
              [
                { id: "services" as const, label: "Services" },
                { id: "why-us" as const, label: "Why Us" },
                { id: "about" as const, label: "About Our Company" },
              ] as const
            ).map(({ id, label }) => (
              <li key={id} className="border-b border-solid border-gray-100">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3 font-medium text-site-text"
                  aria-expanded={mobileSection === id}
                  onClick={() => setMobileSection((current) => (current === id ? null : id))}
                >
                  {label}
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={`transition-transform ${mobileSection === id ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileSection === id && id === "services" && (
                  <ul className="pb-3 pl-3">
                    {serviceMenuGroups.map((group) => (
                      <li key={group.title} className="mt-2">
                        <Link
                          href={group.href}
                          className="block py-1.5 text-sm font-semibold text-brand-blue"
                          onClick={closeMenus}
                        >
                          {group.title}
                        </Link>
                        <ul className="mt-1 space-y-1 pl-3">
                          {group.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                className="block py-1 text-sm text-gray-600"
                                onClick={closeMenus}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
                {mobileSection === id && id === "why-us" && (
                  <ul className="space-y-1 pb-3 pl-3">
                    {whyUsNavLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block py-1.5 text-sm text-gray-600"
                          onClick={closeMenus}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {mobileSection === id && id === "about" && (
                  <ul className="space-y-1 pb-3 pl-3">
                    {aboutNavLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block py-1.5 text-sm text-gray-600"
                          onClick={closeMenus}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            {utilityNavLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border-b border-solid border-gray-100 py-3 font-medium text-site-text"
                  onClick={closeMenus}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li>
              <Link
                href="/#estimate"
                className="my-3 flex items-center justify-center gap-2 rounded-lg bg-site-nav-cta px-5 py-3 font-medium text-white"
                onClick={closeMenus}
              >
                <ClipboardCheck size={16} aria-hidden />
                Get A Free Quote
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
