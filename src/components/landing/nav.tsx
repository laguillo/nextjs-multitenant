'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Menu, X, Terminal } from 'lucide-react';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { GithubIcon } from '@/components/shared/icons';

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#deploy', label: 'Deploy' },
    { href: '#stack', label: 'Stack' },
    { href: '#faq', label: 'FAQ' }
  ];

  return (
    <>
      <header className='border-border bg-background/70 sticky top-0 z-50 border-b backdrop-blur-md [backdrop-filter:saturate(180%)_blur(12px)]'>
        <div className='mx-auto flex h-15 max-w-280 items-center justify-between px-6'>
          <Link
            href='/'
            className='flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-[-0.02em]'
          >
            <span className='bg-primary text-primary-foreground grid size-7.5 place-items-center rounded-xl'>
              <Terminal className='size-4.25' />
            </span>
            Multi-Tenant Starter
          </Link>

          <nav className='hidden items-center gap-1 md:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='text-muted-foreground hover:text-foreground hover:bg-muted rounded-[calc(var(--radius)-2px)] px-3 py-[0.45rem] text-sm font-[450] transition-colors'
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-2'>
            <ModeToggle />

            <a
              href='https://github.com/laguillo/nextjs-better-auth-prisma-template'
              target='_blank'
              rel='noopener noreferrer'
              className='border-border bg-background text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-[calc(var(--radius)-2px)] border transition-colors'
              aria-label='GitHub'
            >
              <GithubIcon />
            </a>

            <a
              href='https://railway.com/new/template/ZweBXA?utm_medium=integration&utm_source=button&utm_campaign=generic'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src='https://railway.com/button.svg'
                alt='Deploy on Railway'
                width={183}
                height={40}
              />
            </a>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className='border-border bg-background text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-[calc(var(--radius)-2px)] border transition-colors md:hidden'
              aria-label='Menu'
            >
              {menuOpen ? (
                <X className='size-4.5' />
              ) : (
                <Menu className='size-4.5' />
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className='border-border bg-background fixed inset-x-0 top-15 z-40 flex flex-col gap-1 border-t p-6 md:hidden'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className='border-border hover:bg-muted rounded-lg border-b px-3 py-4 text-[1.05rem] font-[450] transition-colors last:border-b-0'
            >
              {link.label}
            </Link>
          ))}
          <a
            href='https://github.com/laguillo/nextjs-better-auth-prisma-template'
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => setMenuOpen(false)}
            className='border-border hover:bg-muted rounded-lg border-b px-3 py-4 text-[1.05rem] font-[450] transition-colors'
          >
            GitHub ↗
          </a>
          <Link
            href='#deploy'
            onClick={() => setMenuOpen(false)}
            className='bg-primary text-primary-foreground mt-4 flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90'
          >
            <Zap className='size-4' />
            Deploy on Railway
          </Link>
        </div>
      )}
    </>
  );
}
