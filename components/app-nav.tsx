import { Building2, Mail, UsersRound } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/schools", label: "Schools", icon: Building2 },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/vwms", label: "VWMs", icon: UsersRound },
];

export function AppNav() {
  return (
    <header className="app-header">
      <Link
        className="brand"
        href="/schools"
        aria-label="Finalsite project desk"
      >
        <span className="brand-mark">F</span>
        <span>
          <strong>Project Desk</strong>
          <small>Email automation prototype</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            {label}
          </Link>
        ))}
      </nav>
      <span className="prototype-badge">Prototype</span>
    </header>
  );
}
