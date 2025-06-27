export default function CategoryCard({ name, count, icon }) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-primary transition-colors cursor-pointer group">
      <div className="text-center">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-gray-400 text-sm">{count} phim</p>
      </div>
    </div>
  );
}
