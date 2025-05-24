import os
import argparse
from icrawler.builtin import GoogleImageCrawler
 
def download_images(query, num_images=5, output_dir="images"):
    """
    Tải ảnh từ Google Images bằng icrawler
    
    Args:
        query: Từ khóa tìm kiếm
        num_images: Số lượng ảnh cần tải
        output_dir: Thư mục lưu ảnh
    """
    # Tạo thư mục output nếu chưa tồn tại
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print(f"🔍 Đang tìm kiếm và tải ảnh với từ khóa: '{query}'")
    
    # Khởi tạo crawler
    google_crawler = GoogleImageCrawler(
        storage={'root_dir': output_dir},
        feeder_threads=1,
        parser_threads=1,
        downloader_threads=4
    )
    
    # Tìm kiếm và tải ảnh
    try:
        filters = dict(
            size='large',  # 'large', 'medium', 'icon'
            type='photo',  # 'photo', 'face', 'clipart', 'lineart'
            color='color'  # 'color', 'blackandwhite', 'transparent'
        )
        
        google_crawler.crawl(
            keyword=query,
            max_num=num_images,
            filters=filters,
            file_idx_offset=0
        )
        
        print(f"✅ Hoàn thành! Đã tải ảnh vào thư mục '{output_dir}'")
        print(f"📁 Đường dẫn đầy đủ: {os.path.abspath(output_dir)}")
        
    except Exception as e:
        print(f"❌ Lỗi khi tải ảnh: {e}")
 
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tải ảnh từ Google Images")
    parser.add_argument("query", help="Từ khóa tìm kiếm")
    parser.add_argument("-n", "--num", type=int, default=5, help="Số lượng ảnh cần tải (mặc định: 5)")
    parser.add_argument("-o", "--output", help="Thư mục lưu ảnh (mặc định: tên từ khóa)")
    
    args = parser.parse_args()
    
    # Nếu không chỉ định output, tạo thư mục theo tên query
    output_dir = args.output if args.output else args.query.replace(" ", "_")
    
    # Tải ảnh
    download_images(args.query, args.num, output_dir)