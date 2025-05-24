import os
from icrawler.builtin import GoogleImageCrawler
import win32com.client
import tempfile
import shutil
from enum import Enum

class ImageInsertMode(Enum):
    INSERT = "insert"  # Chèn ảnh giữ nguyên tỷ lệ
    CROP = "crop"     # Cắt và co giãn ảnh vừa khung

def insert_image(slide, image_path, left, top, width, height, mode: ImageInsertMode):
    """
    Chèn ảnh vào slide với tùy chọn chèn/cắt
    """
    shape = slide.Shapes.AddPicture(
        FileName=image_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=left,
        Top=top,
        Width=width,
        Height=height
    )
    
    if mode == ImageInsertMode.INSERT:
        # Giữ tỷ lệ ảnh gốc
        img_ratio = shape.Width / shape.Height
        frame_ratio = width / height
        
        if img_ratio > frame_ratio:
            # Ảnh rộng hơn
            new_height = width / img_ratio
            shape.Width = width
            shape.Height = new_height
            shape.Top = top + (height - new_height) / 2
        else:
            # Ảnh cao hơn
            new_width = height * img_ratio
            shape.Height = height
            shape.Width = new_width
            shape.Left = left + (width - new_width) / 2
    
    # Nếu là CROP thì giữ nguyên kích thước đã set

def search_and_insert_images(query, num_images=5, slide_index=1, mode=ImageInsertMode.INSERT, padding=20):
    """
    Tìm kiếm ảnh và chèn vào slide PowerPoint
    
    Args:
        query: Từ khóa tìm kiếm
        num_images: Số lượng ảnh cần tìm
        slide_index: Index của slide muốn chèn ảnh (bắt đầu từ 1)
        mode: Chế độ chèn ảnh (INSERT/CROP)
        padding: Khoảng cách giữa các ảnh (points)
    """
    temp_dir = tempfile.mkdtemp()
    
    try:
        print(f"🔍 Đang tìm kiếm ảnh với từ khóa: '{query}'")
        
        google_crawler = GoogleImageCrawler(
            storage={'root_dir': temp_dir},
            feeder_threads=1,
            parser_threads=1,
            downloader_threads=4
        )
        
        filters = dict(
            size='large',
            type='photo',
            color='color'
        )
        
        google_crawler.crawl(
            keyword=query,
            max_num=num_images,
            filters=filters,
            file_idx_offset=0
        )
        
        print("📊 Đang kết nối với PowerPoint...")
        ppt = win32com.client.Dispatch("PowerPoint.Application")
        presentation = ppt.ActivePresentation
        
        try:
            slide = presentation.Slides(slide_index)
        except:
            print(f"❌ Không tìm thấy slide {slide_index}")
            return
        
        print("🖼️ Đang chèn ảnh vào slide...")
        
        image_files = [f for f in os.listdir(temp_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
        
        # Tính toán layout
        slide_width = presentation.PageSetup.SlideWidth
        slide_height = presentation.PageSetup.SlideHeight
        
        cols = min(3, num_images)  # Tối đa 3 cột
        rows = (num_images + cols - 1) // cols
        
        # Tính kích thước khung ảnh
        frame_width = (slide_width - (cols + 1) * padding) / cols
        frame_height = (slide_height - (rows + 1) * padding) / rows
        
        for i, image_file in enumerate(image_files):
            row = i // cols
            col = i % cols
            
            left = padding + col * (frame_width + padding)
            top = padding + row * (frame_height + padding)
            
            image_path = os.path.join(temp_dir, image_file)
            insert_image(slide, image_path, left, top, frame_width, frame_height, mode)
        
        print(f"✅ Hoàn thành! Đã chèn ảnh vào slide với chế độ: {mode.value}")
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
    
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Tìm và chèn ảnh vào PowerPoint")
    parser.add_argument("query", help="Từ khóa tìm kiếm")
    parser.add_argument("-n", "--num", type=int, default=5, help="Số lượng ảnh (mặc định: 5)")
    parser.add_argument("-s", "--slide", type=int, default=1, help="Số thứ tự slide (mặc định: 1)")
    parser.add_argument("-m", "--mode", type=str, choices=['insert', 'crop'], 
                       default='insert', help="Chế độ chèn ảnh (mặc định: insert)")
    parser.add_argument("-p", "--padding", type=int, default=20, 
                       help="Khoảng cách giữa các ảnh (points) (mặc định: 20)")
    
    args = parser.parse_args()
    mode = ImageInsertMode(args.mode)
    search_and_insert_images(args.query, args.num, args.slide, mode, args.padding) 