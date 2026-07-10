export function UserCell({
  name,
  email,
  avatar,
}: {
  name: string;
  email?: string;
  avatar: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="h-9 w-9 rounded-full bg-muted" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
      </div>
    </div>
  );
}