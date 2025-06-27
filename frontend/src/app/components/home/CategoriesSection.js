import CategoryCard from './CategoryCard';

export default function CategoriesSection() {
  const categories = [
    { name: "Phim Hành Động", count: "1,234", icon: "⚔️" },
    { name: "Phim Tình Cảm", count: "856", icon: "💕" },
    { name: "Phim Kinh Dị", count: "432", icon: "👻" },
    { name: "Phim Hài Hước", count: "678", icon: "😂" },
    { name: "Phim Anime", count: "1,567", icon: "🎌" },
    { name: "Phim Khoa Học", count: "234", icon: "🚀" },
    { name: "Phim Chiến Tranh", count: "345", icon: "⚰️" },
    { name: "Phim Tài Liệu", count: "123", icon: "📹" }
  ];

  return (
    <section className="py-12 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Danh Mục Phim</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              name={category.name}
              count={category.count}
              icon={category.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
