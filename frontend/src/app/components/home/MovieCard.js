export default function MovieCard({ title, year, quality = "HD", index }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
          <p className="text-gray-300 text-xs">{year} • {quality}</p>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-primary text-white text-xs px-2 py-1 rounded">{quality}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary/80 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
