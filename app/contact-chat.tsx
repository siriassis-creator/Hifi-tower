"use client";

import { useEffect, useRef, useState } from "react";

import type { ContactChannel } from "../lib/content-types";

function ChannelIcon({ name }: { name: string }) {
  if (name === "facebook") return <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1877f2" /><path d="M18.2 27V17h3.4l.5-4h-3.9v-2.5c0-1.2.3-2 2-2h2V5a27 27 0 0 0-3-.2c-3 0-5 1.8-5 5V13h-3.3v4h3.3v10z" fill="white" /></svg>;
  if (name === "line") return <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#06c755" /><path d="M27 14.5c0-5-5-9-11-9s-11 4-11 9c0 4.5 4 8.2 9.3 8.9.4.1.6.3.5.8l-.3 1.8c-.1.5.3.7.7.4C22 22 27 18.9 27 14.5Z" fill="white" /><text x="16" y="17.5" textAnchor="middle" fontSize="7.5" fontFamily="Arial,sans-serif" fontWeight="700" fill="#06c755">LINE</text></svg>;
  return <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill={name === "email" ? "#bc9255" : "#3c6558"} />{name === "email" ? <g stroke="white" strokeWidth="1.7" fill="none"><rect x="6" y="9" width="20" height="14" rx="2" /><path d="m7 10 9 7 9-7" /></g> : <path d="m10 6 4 5-2.5 2.6c1.8 3.1 3.8 5.1 7 7l2.6-2.6 5 4c-1.3 4-4.3 4.5-7.5 3-5-2.5-9.1-6.6-11.6-11.6C5.5 10.2 6 7.3 10 6Z" fill="white" />}</svg>;
}

export default function ContactChat({ channels }: { channels: ContactChannel[] }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) { if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false); }
    function closeEscape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);
  return <div className="contact-widget" ref={wrapper}>
    <div className={`contact-panel${open ? " is-open" : ""}`} id="contact-panel" role="dialog" aria-labelledby="contact-title" inert={!open} aria-hidden={!open}>
      <div className="contact-panel-heading"><div><span>HiFi Tower</span><h2 id="contact-title">คุยกับเรา</h2></div><button onClick={() => {setOpen(false);toggle.current?.focus();}} aria-label="ปิดช่องทางติดต่อ">×</button></div>
      <p className="contact-intro">เลือกช่องทางที่สะดวกสำหรับคุณ</p>
      <div className="contact-channels">{channels.map(channel => <a key={channel.id} href={channel.href} target={channel.id === "facebook" || channel.id === "line" ? "_blank" : undefined} rel={channel.id === "facebook" || channel.id === "line" ? "noopener noreferrer" : undefined}><span className="channel-icon"><ChannelIcon name={channel.id} /></span><span><b>{channel.label}</b><small>{channel.detail}</small></span><span className="channel-arrow" aria-hidden="true">↗</span></a>)}</div>
    </div>
    <button ref={toggle} className="contact-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="contact-panel"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 11a8 8 0 0 1-8 8H8l-5 3 1.4-5A8 8 0 1 1 20 11Z" /><path d="M7 10h10M7 14h6" /></svg><span>ติดต่อเรา</span><span className="contact-status" aria-hidden="true" /></button>
  </div>;
}
