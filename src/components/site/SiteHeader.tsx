"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ExternalLink,
  Fence,
  HardHat,
  Home,
  Menu,
  PaintRoller,
  PanelsTopLeft,
  Phone,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import SiteLogo from "@/components/site/SiteLogo";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import {
  aboutNavLinks,
  business,
  serviceMenuGroups,
  utilityNavLinks,
  whyUsNavLinks,
} from "@/lib/site/config";
import { phoneToHref, readRuntimeSiteConfig } from "@/lib/site/runtimeSiteConfig";
import { SITE_CONFIG_UPDATED_EVENT } from "@/lib/admin/siteConfigSettings";

type OpenMenu = "services" | "why-us" | "about" | null;

const serviceGroupIcons: Record<string, LucideIcon> = {
  home: Home,
  hardhat: HardHat,
  paintbrush: PaintRoller,
  fence: Fence,
  panels: PanelsTopLeft,
  building: Building2,
};

const dropdownPanel =
  "absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-solid border-site-line bg-white shadow-[0_24px_60px_-20px_rgba(7,21,48,0.35)]";

type SiteHeaderProps = {
  hasAdminBar?: boolean;
};

export default function SiteHeader({ hasAdminBar = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [mobileSection, setMobileSection] = useState<OpenMenu>(null);
  const [runtimePhone, setRuntimePhone] = useState<string>(business.phone);
  const [runtimePhoneHref, setRuntimePhoneHref] = useState<string>(business.phoneHref);
  const [runtimeBusinessName, setRuntimeBusinessName] = useState<string>(business.displayName);
  const [runtimeNavCtaText, setRuntimeNavCtaText] = useState("Contact Us");
  const [runtimeNavCtaHref, setRuntimeNavCtaHref] = useState("/contact");

  useEffect(() => {
    const applyRuntime = () => {
      const runtime = readRuntimeSiteConfig();
      setRuntimePhone(runtime.phoneMain || business.phone);
      setRuntimePhoneHref(phoneToHref(runtime.phoneMain || business.phone));
      setRuntimeBusinessName(runtime.businessName || business.displayName);
      setRuntimeNavCtaText(runtime.mainMenuCtaText || "Contact Us");
      setRuntimeNavCtaHref(runtime.mainMenuCtaLink || "/contact");
    };

    applyRuntime();
    window.addEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
    return () => window.removeEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
  }, []);

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

  function toggleMenu(menu: OpenMenu, event?: React.MouseEvent) {
    // A mouse click lands after hover already opened the menu — keep it open.
    if (lastPointerType.current === "mouse" && event && event.detail > 0) {
      setOpenMenu(menu);
      return;
    }
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  const lastPointerType = useRef<string>("");

  // Desktop mouse users get hover-to-open; a short delay keeps the panel open
  // while the pointer crosses the gap between the button and the dropdown.
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function menuFromEvent(event: React.PointerEvent<HTMLElement>) {
    return event.currentTarget.dataset.menu as Exclude<OpenMenu, null>;
  }

  function handleMenuPointerEnter(event: React.PointerEvent<HTMLElement>) {
    lastPointerType.current = event.pointerType;
    if (event.pointerType !== "mouse") return;
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    setOpenMenu(menuFromEvent(event));
  }

  function handleMenuPointerDown(event: React.PointerEvent<HTMLElement>) {
    lastPointerType.current = event.pointerType;
  }

  function handleMenuPointerLeave(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const menu = menuFromEvent(event);
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => {
      setOpenMenu((current) => (current === menu ? null : current));
    }, 180);
  }

  useEffect(
    () => () => {
      if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    },
    [],
  );

  function navLinkClass(active: boolean) {
    return `relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors xl:px-4 ${
      active
        ? "text-brand-ink after:absolute after:inset-x-4 after:-bottom-[1.05rem] after:h-0.5 after:rounded-full after:bg-brand-red"
        : "text-site-text hover:text-brand-ink"
    }`;
  }

  const ctaLabel = runtimeNavCtaText || `Get A Free Quote - ${runtimeBusinessName}`;

  return (
    <header
      ref={headerRef}
      className={`sticky z-50 transition-shadow duration-300 ${
        hasAdminBar ? "top-[var(--site-admin-bar-height,32px)]" : "top-0"
      } ${scrolled ? "shadow-[0_8px_30px_-12px_rgba(7,21,48,0.25)]" : ""}`}
    >
      {/* Slim utility bar — desktop only, collapses on scroll */}
      <div
        className={`hidden overflow-hidden bg-brand-ink text-white/70 transition-[height] duration-300 ease-in-out lg:block ${
          scrolled ? "h-0" : "h-10"
        }`}
      >
        <div className="site-container flex h-10 items-center justify-between gap-6 text-[0.8125rem]">
          <p className="flex items-center gap-2">
            <ShieldCheck size={14} aria-hidden className="text-brand-sky" />
            Licensed &amp; insured · {business.license} · {business.heroLocationLine}
          </p>
          <div className="flex items-center gap-6">
            <nav aria-label="Utility navigation" className="flex items-center gap-5">
              {utilityNavLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <span className="h-4 w-px bg-white/15" aria-hidden />
            <a
              href={runtimePhoneHref}
              className="flex items-center gap-2 font-semibold text-white transition-colors hover:text-brand-sky"
            >
              <Phone size={14} aria-hidden />
              {runtimePhone}
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="relative border-b border-solid border-site-line bg-white">
        <div className="site-container flex h-[4.5rem] items-center justify-between gap-6">
          <SiteLogo />

          <nav aria-label="Main navigation" className="hidden items-center lg:flex">
            <Link href="/" className={navLinkClass(pathname === "/")}>
              Home
            </Link>

            <div
              className="relative"
              data-menu="services"
              onPointerEnter={handleMenuPointerEnter}
              onPointerDown={handleMenuPointerDown}
              onPointerLeave={handleMenuPointerLeave}
            >
              <button
                type="button"
                className={navLinkClass(openMenu === "services" || pathname.startsWith("/services"))}
                aria-expanded={openMenu === "services"}
                onClick={(event) => toggleMenu("services", event)}
              >
                Services
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={`transition-transform ${openMenu === "services" ? "rotate-180" : ""}`}
                />
              </button>

              {openMenu === "services" && (
                <div
                  className={`${dropdownPanel} left-1/2 grid w-[46rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 grid-cols-[minmax(0,1fr)_15rem]`}
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 p-6">
                    {serviceMenuGroups.map((group) => {
                      const Icon = serviceGroupIcons[group.icon] ?? Home;
                      return (
                        <div key={group.title}>
                          <Link
                            href={group.href}
                            className="group flex items-center gap-2.5 font-display text-[0.9375rem] font-semibold text-brand-ink hover:text-brand-blue"
                            onClick={closeMenus}
                          >
                            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-blue/8 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                              <Icon size={16} strokeWidth={2} aria-hidden />
                            </span>
                            {group.title}
                          </Link>
                          <ul className="mt-2 space-y-0.5 pl-[2.625rem]">
                            {group.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  className="block rounded-md py-1 text-[0.8125rem] text-site-text-muted transition-colors hover:text-brand-ink"
                                  onClick={closeMenus}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-ink bg-blueprint flex flex-col justify-between p-6">
                    <div>
                      <p className="eyebrow eyebrow-light">Free Estimate</p>
                      <p className="mt-3 font-display text-lg font-semibold leading-snug text-white">
                        Not sure what your project needs?
                      </p>
                      <p className="mt-2 text-[0.8125rem] leading-relaxed text-white/65">
                        Tell us about it — we&apos;ll point you in the right direction.
                      </p>
                    </div>
                    <div className="mt-6 space-y-2">
                      <EstimateCtaLink
                        href="/#estimate"
                        onClick={closeMenus}
                        className="btn btn-primary btn-sm w-full"
                      >
                        Get an Estimate
                      </EstimateCtaLink>
                      <Link
                        href="/services"
                        onClick={closeMenus}
                        className="btn btn-glass btn-sm w-full"
                      >
                        All Services
                        <ArrowRight size={14} aria-hidden className="btn-arrow" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/projects" className={navLinkClass(pathname.startsWith("/projects"))}>
              Projects
            </Link>

            <a
              href={business.financingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={navLinkClass(false)}
            >
              Financing
              <ExternalLink size={13} aria-hidden className="opacity-60" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>

            <div
              className="relative"
              data-menu="why-us"
              onPointerEnter={handleMenuPointerEnter}
              onPointerDown={handleMenuPointerDown}
              onPointerLeave={handleMenuPointerLeave}
            >
              <button
                type="button"
                className={navLinkClass(openMenu === "why-us")}
                aria-expanded={openMenu === "why-us"}
                onClick={(event) => toggleMenu("why-us", event)}
              >
                Why Us
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={`transition-transform ${openMenu === "why-us" ? "rotate-180" : ""}`}
                />
              </button>

              {openMenu === "why-us" && (
                <div className={`${dropdownPanel} left-0 w-72 p-2`}>
                  <ul>
                    {whyUsNavLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block rounded-xl px-4 py-2.5 text-[0.9375rem] text-site-text transition-colors hover:bg-site-surface hover:text-brand-ink"
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

            <div
              className="relative"
              data-menu="about"
              onPointerEnter={handleMenuPointerEnter}
              onPointerDown={handleMenuPointerDown}
              onPointerLeave={handleMenuPointerLeave}
            >
              <button
                type="button"
                className={navLinkClass(
                  openMenu === "about" ||
                    pathname.startsWith("/about") ||
                    pathname.startsWith("/contact"),
                )}
                aria-expanded={openMenu === "about"}
                onClick={(event) => toggleMenu("about", event)}
              >
                About
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={`transition-transform ${openMenu === "about" ? "rotate-180" : ""}`}
                />
              </button>

              {openMenu === "about" && (
                <div className={`${dropdownPanel} right-0 w-64 p-2`}>
                  <ul>
                    {aboutNavLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block rounded-xl px-4 py-2.5 text-[0.9375rem] text-site-text transition-colors hover:bg-site-surface hover:text-brand-ink"
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

          <div className="flex items-center gap-2">
            <EstimateCtaLink
              href={runtimeNavCtaHref}
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              {ctaLabel}
              <ArrowRight size={15} aria-hidden className="btn-arrow" />
            </EstimateCtaLink>
            <a
              href={runtimePhoneHref}
              aria-label={`Call ${runtimePhone}`}
              className="flex size-11 items-center justify-center rounded-full border border-solid border-site-line text-brand-ink transition-colors hover:bg-site-surface lg:hidden"
            >
              <Phone size={18} aria-hidden />
            </a>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full bg-brand-ink text-white transition-colors hover:bg-brand-navy lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="max-h-[calc(100dvh-4.5rem-var(--site-admin-bar-height,0px))] overflow-y-auto border-b border-solid border-site-line bg-white lg:hidden"
        >
          <ul className="site-container py-3">
            {[
              { href: "/", label: "Home" },
              { href: "/projects", label: "Projects" },
            ].map((item) => (
              <li key={item.href} className="border-b border-solid border-site-line">
                <Link
                  href={item.href}
                  className="block py-4 font-display text-lg font-semibold text-brand-ink"
                  onClick={closeMenus}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="border-b border-solid border-site-line">
              <a
                href={business.financingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-4 font-display text-lg font-semibold text-brand-ink"
                onClick={closeMenus}
              >
                Financing
                <ExternalLink size={16} aria-hidden className="opacity-60" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>

            {(
              [
                { id: "services" as const, label: "Services" },
                { id: "why-us" as const, label: "Why Us" },
                { id: "about" as const, label: "About" },
              ] as const
            ).map(({ id, label }) => (
              <li key={id} className="border-b border-solid border-site-line">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 font-display text-lg font-semibold text-brand-ink"
                  aria-expanded={mobileSection === id}
                  onClick={() => setMobileSection((current) => (current === id ? null : id))}
                >
                  {label}
                  <span
                    className={`flex size-8 items-center justify-center rounded-full bg-site-surface transition-transform ${
                      mobileSection === id ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown size={16} aria-hidden />
                  </span>
                </button>
                {mobileSection === id && id === "services" && (
                  <div className="space-y-4 pb-5">
                    {serviceMenuGroups.map((group) => {
                      const Icon = serviceGroupIcons[group.icon] ?? Home;
                      return (
                        <div key={group.title}>
                          <Link
                            href={group.href}
                            className="flex items-center gap-2.5 py-1 font-semibold text-brand-ink"
                            onClick={closeMenus}
                          >
                            <Icon size={17} strokeWidth={2} aria-hidden className="text-brand-blue" />
                            {group.title}
                          </Link>
                          <ul className="mt-1 space-y-0.5 border-l border-solid border-site-line pl-4 ml-2">
                            {group.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  className="block py-1.5 text-[0.9375rem] text-site-text"
                                  onClick={closeMenus}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                    <Link
                      href="/services"
                      className="link-arrow"
                      onClick={closeMenus}
                    >
                      All Services
                      <ArrowRight size={15} aria-hidden />
                    </Link>
                  </div>
                )}
                {mobileSection === id && id !== "services" && (
                  <ul className="space-y-0.5 pb-4">
                    {(id === "why-us" ? whyUsNavLinks : aboutNavLinks).map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block py-2 text-[0.9375rem] text-site-text"
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

            {utilityNavLinks
              .filter((item) => item.href !== "/projects")
              .map((item) => (
                <li key={item.href} className="border-b border-solid border-site-line">
                  <Link
                    href={item.href}
                    className="block py-4 font-display text-lg font-semibold text-brand-ink"
                    onClick={closeMenus}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            <li className="grid gap-3 pb-4 pt-6 sm:grid-cols-2">
              <EstimateCtaLink
                href={runtimeNavCtaHref}
                className="btn btn-primary w-full"
                onClick={closeMenus}
              >
                {ctaLabel}
              </EstimateCtaLink>
              <a href={runtimePhoneHref} className="btn btn-outline w-full">
                <Phone size={16} aria-hidden />
                {runtimePhone}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
