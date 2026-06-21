interface AvatarProps {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, username, email, src, size = 36, className = '' }: AvatarProps) {
  const initial = (name || username || email || '?').trim()[0]?.toUpperCase() || '?';
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-semibold bg-gradient-to-br from-primary to-accent ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img src={src} alt={name || username || 'avatar'} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
