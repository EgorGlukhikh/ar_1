export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200"
          style={{ borderTopColor: "#7C5CFC" }}
        />
        <p className="text-sm text-gray-400">Загрузка...</p>
      </div>
    </div>
  );
}
