export function Gallery() {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-6">Gallery</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
        <p className="text-gray-500 mb-4">Your generations will appear here</p>
        <a
          href="/generate"
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors"
        >
          Create something
        </a>
      </div>
    </div>
  );
}
