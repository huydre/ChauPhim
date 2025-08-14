export default function CategoryCard({ name, count, index = 0 }) {
  // Mảng các gradient màu đẹp mắt
  const gradients = [
    'from-blue-500/20 to-purple-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-600/30',
    'from-emerald-500/20 to-teal-600/20 border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-600/30',
    'from-rose-500/20 to-pink-600/20 border-rose-500/30 hover:from-rose-500/30 hover:to-pink-600/30',
    'from-amber-500/20 to-orange-600/20 border-amber-500/30 hover:from-amber-500/30 hover:to-orange-600/30',
    'from-violet-500/20 to-indigo-600/20 border-violet-500/30 hover:from-violet-500/30 hover:to-indigo-600/30',
    'from-cyan-500/20 to-blue-600/20 border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-600/30',
    'from-red-500/20 to-rose-600/20 border-red-500/30 hover:from-red-500/30 hover:to-rose-600/30'
  ];

  const gradientClass = gradients[index % gradients.length];

  return (
    <div className={`
      flex-1 min-w-[200px] max-w-[280px] h-[140px] 
      bg-gradient-to-br ${gradientClass}
      backdrop-blur-sm border rounded-2xl 
      hover:scale-105 hover:shadow-xl hover:shadow-black/20
      transition-all duration-300 cursor-pointer group
      flex items-center justify-center p-6
    `}>
      <div className="text-center space-y-2">
        <h3 className="text-white font-bold text-lg group-hover:text-white/90 transition-colors leading-tight">
          {name}
        </h3>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          <p className="text-white/80 text-sm font-medium">{count} phim</p>
          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
