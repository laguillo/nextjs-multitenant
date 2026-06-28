'use client';

import { useState } from 'react';

const ITEMS = [
  {
    q: 'How does multi-tenancy work?',
    a: (
      <>
        Each organization gets its own scoped route at{' '}
        <code className='font-mono text-[0.85em]'>/tenant/[slug]</code>. When a
        user is authenticated and belongs to an organization, they access its
        data in isolation from all other tenants. Membership is validated in the
        layout — not just middleware — so there&apos;s no way for a tenant to
        access another tenant&apos;s data even with a valid session.
      </>
    )
  },
  {
    q: 'How do member invitations work?',
    a: "An organization owner sends an invitation via Better Auth's organization plugin. The invited user receives an email with a link that, once clicked, accepts the invitation and adds them as a member with the specified role. The entire invite flow — token generation, email delivery, and membership creation — is pre-configured."
  },
  {
    q: 'Which authentication methods are supported?',
    a: 'Better Auth ships with email & password (with email verification), Google OAuth, and more. Everything is pre-configured — just add your provider keys to the environment variables.'
  },
  {
    q: 'Can I customize roles per tenant?',
    a: (
      <>
        Yes. The starter ships with{' '}
        <code className='font-mono text-[0.85em]'>owner</code> and{' '}
        <code className='font-mono text-[0.85em]'>member</code> roles built on
        Better Auth&apos;s access control layer. You can add custom roles and
        permissions in{' '}
        <code className='font-mono text-[0.85em]'>
          src/lib/auth-permissions.ts
        </code>{' '}
        without changing the database schema.
      </>
    )
  },
  {
    q: 'Is the template free to use?',
    a: "Yes. It's open source under the MIT license — clone it, deploy it, and use it for personal or commercial projects with no strings attached."
  }
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className='mx-auto mt-10 max-w-190'>
      {ITEMS.map((item, i) => (
        <div key={i} className='border-border border-b last:border-b-0'>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className='flex w-full cursor-pointer items-center justify-between gap-4 px-1 py-4.5 text-left text-base font-medium tracking-[-0.01em]'
          >
            <span>{item.q}</span>
            <span
              className='text-muted-foreground flex-none transition-transform duration-200'
              style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}
            >
              <svg
                viewBox='0 0 24 24'
                width='18'
                height='18'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              >
                <path d='M12 5v14M5 12h14' />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className='text-muted-foreground max-w-160 px-1 pb-4.5 text-[0.92rem] text-pretty'>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
