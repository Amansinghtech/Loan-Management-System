export function ModuleHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {typeof count === 'number' && (
        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
          {count} {count === 1 ? 'record' : 'records'}
        </span>
      )}
    </div>
  );
}
