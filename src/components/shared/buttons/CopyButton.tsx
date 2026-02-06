'use client';

import { useState } from 'react';
import { CheckCircle2, Files } from 'lucide-react';
import { Button, type ButtonProps } from './Button';
import { twMerge } from 'tailwind-merge';

interface CopyButtonProps extends Omit<ButtonProps, 'iconSize'> {
  value: string;
  onCopy?: () => void;
  iconSize?: number;
}

export function CopyButton({
  value,
  iconSize = 16,
  onCopy,
  children,
  className,
  variant = 'secondary',
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }

    try {
      await navigator?.clipboard?.writeText(value);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      variant={variant}
      className={twMerge(isCopied && 'bg-success', className)}
      {...props}
      iconSize={iconSize}
      onClick={handleCopy}
      icon={isCopied ? null : props.icon}
    >
      {isCopied ? <CheckCircle2 size={iconSize} /> : children || <Files size={iconSize} />}
    </Button>
  );
}
