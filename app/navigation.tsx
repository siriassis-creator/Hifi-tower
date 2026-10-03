"use client";

import { useState } from "react";

type Item = { slug: string; label: string; href: string };
type Category = { slug: string; name: string };

export default function Navigation({ items, categories }: { items: Item[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  return <div className="navigation">
    <button className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>เมนู <span aria-hidden="true">☰</span></button>
    <nav id="main-navigation" aria-label="Main navigation" className={open ? "is-open" : undefined}>
      {items.map(item => item.slug === "shop" ? <details className="shop-menu" key={item.slug}>
        <summary>{item.label} <span aria-hidden="true">⌄</span></summary>
        <div className="shop-dropdown">{categories.map(category => <a key={category.slug} href="#products" onClick={() => setOpen(false)}>{category.name}</a>)}</div>
      </details> : <a key={item.slug} className={item.slug === "home" ? "active" : undefined} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
    </nav>
  </div>;
}
