import CategoryCard from './CategoryCard';

export default function CategoriesSection() {
  const categories = [
    { name: "Phim Hành Động", count: "1,234" },
    { name: "Phim Tình Cảm", count: "856" },
    { name: "Phim Kinh Dị", count: "432" },
    { name: "Phim Hài Hước", count: "678" },
    { name: "Phim Anime", count: "1,567" },
    { name: "Phim Khoa Học", count: "234" },
    { name: "+4 chủ đề", count: "345" }
  ];

  return (
    <section className="py-16 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Bạn đang quan tâm gì?</h2>
          <p className="text-gray-400 text-lg">Khám phá những thể loại phim hấp dẫn nhất</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              name={category.name}
              count={category.count}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
