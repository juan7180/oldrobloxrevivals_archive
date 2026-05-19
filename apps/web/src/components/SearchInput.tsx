function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 8.5a6.5 6.5 0 1111.436 4.23l3.177 3.177a.75.75 0 11-1.061 1.06l-3.178-3.177A6.5 6.5 0 012 8.5z" />
    </svg>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  onSubmit?: () => void;
}) {
  const input = (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-reddit-bg border border-reddit-border rounded-full py-1.5 pl-9 pr-4 text-sm text-reddit-text placeholder:text-reddit-muted focus:outline-none focus:border-reddit-blue ${inputClassName}`}
    />
  );

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-reddit-muted pointer-events-none" />
      {onSubmit ? (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>{input}</form>
      ) : (
        input
      )}
    </div>
  );
}
