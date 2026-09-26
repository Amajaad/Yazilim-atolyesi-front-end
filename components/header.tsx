"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";
import { Icon } from "./icon";
import { request } from "../lib/api";
const links = [
  ["anasayfa", "Ana Sayfa"],
  ["hakkimizda", "Hakkımızda"],
  ["duyurular", "Duyurular"],
  ["takim", "Takım Alanı"],
  ["iletisim", "İletişim"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("anasayfa");
  const [manager, setManager] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    request<{ roles: string[] }>("users/me").then(profile => {
      if (active) setManager(profile.roles.some(role => role === "ADMIN" || role === "EDITOR"));
    }).catch(() => { if (active) setManager(false); });
    return () => { active = false; };
  }, [pathname]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -60% 0px" },
    );
    links.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Kapat" : "Menü"}
          <span aria-hidden="true">{open ? "×" : "☰"}</span>
        </button>
        <div
          id="site-navigation"
          className={`header-navigation${open ? " is-open" : ""}`}
        >
          <nav aria-label="Ana navigasyon">
            {links.map(([id, label]) => {
              const isCurrentPage = id === "duyurular" && pathname === "/duyurular";
              const isCurrentSection = active === id && pathname === "/";
              return (
              <a
                key={id}
                href={isCurrentPage ? "/duyurular" : `/#${id}`}
                className={isCurrentPage || isCurrentSection ? "is-active" : ""}
                aria-current={
                  isCurrentPage ? "page" : isCurrentSection ? "location" : undefined
                }
                onClick={() => {
                  setActive(id);
                  setOpen(false);
                }}
              >
                {label}
              </a>
              );
            })}
          </nav>
          <div className="header-actions">
            <a className="club-button button-outline" href={manager ? "/yonetim" : "/giris-yap"}>
              <Icon name="user" />
              {manager ? "Yönetim Paneli" : "Giriş Yap"}
            </a>
            <a className="club-button" href="/uye-kaydi">
              <Icon name="user" />
              Üye Kaydı
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
