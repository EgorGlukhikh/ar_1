export default function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700"
        style={{ borderTopColor: "#7C5CFC" }}
      />
    </div>
  );
}
