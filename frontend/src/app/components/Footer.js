import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.svg" alt="ChauPhim Logo" width={40} height={40} />
              <div>
                <h3 className="text-white font-bold">ChauPhim</h3>
                <p className="text-gray-400 text-sm">Phim hay cả chậu</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Trang web xem phim miễn phí chất lượng cao, cập nhật liên tục những bộ phim mới nhất.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Danh Mục</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Phim lẻ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Phim bộ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Anime</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Phim chiếu rạp</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Thể Loại</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Hành động</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tình cảm</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kinh dị</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Hài hước</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Liên Hệ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: info@chauphim.vn</li>
              <li>Điện thoại: 0123 456 789</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 ChauPhim. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
