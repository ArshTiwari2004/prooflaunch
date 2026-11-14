import Link from "next/link";
import { apiFetch, hasSession } from "@/lib/api";
import type { UserView } from "@/lib/types";
import CommandSearch from "./CommandSearch";
import Icon from "./Icon";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";

async function currentUser(): Promise<UserView | null> {
  if (!hasSession()) return null;
  try {
    return await apiFetch<UserView>("/me");
  } catch {
    return null;
  }
}

export default async function Header() {
  const user = await currentUser();
  const links = [
    { href: "/launches", label: "launches" },
    { href: "/pricing", label: "pricing" },
    { href: "/how-scoring-works", label: "how ranking works" },
  ];
  if (user) links.push({ href: "/dashboard", label: "dashboard" });

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="prooflaunch home">
          <Logo />
          <span>prooflaunch</span>
        </Link>
        <nav className="nav" aria-label="main">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <CommandSearch />
          <Link href="/submit" className="btn btn-primary btn-sm hide-md">
            <Icon name="plus" size={15} />
            launch product
          </Link>
          {user ? (
            <>
              <span className="avatar hide-md" title={user.displayName} aria-label={`signed in as ${user.displayName}`}>
                {user.displayName.slice(0, 1).toLowerCase()}
              </span>
              <span className="hide-md">
                <LogoutButton />
              </span>
            </>
          ) : (
            <Link href="/login" className="btn btn-secondary btn-sm hide-md">
              sign in
            </Link>
          )}
          <details className="mobile-menu">
            <summary aria-label="open menu">
              <Icon name="menu" size={20} />
            </summary>
            <nav aria-label="mobile">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
              <Link href="/submit">launch product</Link>
              {!user && <Link href="/login">sign in</Link>}
              {user && <Link href="/dashboard">dashboard</Link>}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
