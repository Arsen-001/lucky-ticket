import { twMerge } from 'tailwind-merge';

interface HighlightedTextProps {
  children: string;
  highlight: string;
  className?: string;
  classNames?: {
    selection?: string;
  };
}

export function HighlightedText({
  children,
  highlight,
  className,
  classNames,
}: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{children}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = children?.split(regex);

  return (
    <span className={className}>
      {parts?.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className={twMerge(
              'bg-pink text-white-secondary rounded-sm px-px py-px',
              classNames?.selection
            )}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
