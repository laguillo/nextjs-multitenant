'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText
} from '@/components/ui/input-group';

const CMD =
  'git clone https://github.com/laguillo/nextjs-better-auth-prisma-template';
const CMD_DISPLAY =
  'git clone github.com/laguillo/nextjs-better-auth-prisma-template';

export function CopyCommand() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(CMD);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1600);
  };

  return (
    <InputGroup className='border-border bg-card mx-auto mt-7 h-11.5 max-w-110 rounded-lg px-1.5 font-mono text-[0.85rem] shadow-sm'>
      <InputGroupAddon align='inline-start'>
        <InputGroupText className='select-none'>$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput value={CMD_DISPLAY} readOnly className='text-ellipsis' />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          aria-label='Copy command'
          title='Copy command'
          size='icon-sm'
          className='border-border bg-background hover:bg-muted rounded-md border'
          onClick={handleCopy}
        >
          {isCopied ? <Check /> : <Copy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
