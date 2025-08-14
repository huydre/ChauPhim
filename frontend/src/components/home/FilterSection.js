export default function FilterSection() {
  return (
    <section className="py-8 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <span className="text-gray-400 font-semibold">Lọc theo:</span>
          <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Tất cả thể loại</option>
            <option>Hành động</option>
            <option>Tình cảm</option>
            <option>Kinh dị</option>
            <option>Hài hước</option>
            <option>Khoa học viễn tưởng</option>
          </select>
          <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Tất cả quốc gia</option>
            <option>Việt Nam</option>
            <option>Hàn Quốc</option>
            <option>Trung Quốc</option>
            <option>Nhật Bản</option>
            <option>Âu Mỹ</option>
          </select>
          <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Năm phát hành</option>
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>
      </div>
    </section>
  );
}
