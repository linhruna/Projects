import os
from typing import List, Dict, Optional
import requests
from PIL import Image
from io import BytesIO
import win32com.client
import pythoncom
import win32clipboard
from io import BytesIO
import logging
import base64
import tempfile

# Cấu hình logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def send_to_clipboard(image):
    """Gửi ảnh vào clipboard"""
    output = BytesIO()
    image.convert('RGB').save(output, 'BMP')
    data = output.getvalue()[14:]  # Bỏ qua header của BMP
    output.close()
    
    win32clipboard.OpenClipboard()
    win32clipboard.EmptyClipboard()
    win32clipboard.SetClipboardData(win32clipboard.CF_DIB, data)
    win32clipboard.CloseClipboard()

class PPTImageHandler:
    def __init__(self):
        self.ppt = None
        pythoncom.CoInitialize()
        
    def __del__(self):
        try:
            pythoncom.CoUninitialize()
        except:
            pass
        
    def connect_to_powerpoint(self):
        """Kết nối với PowerPoint application đang chạy"""
        logger.debug("Đang kết nối với PowerPoint...")
        try:
            if self.ppt is None:
                self.ppt = win32com.client.GetActiveObject("PowerPoint.Application")
            logger.debug("Kết nối PowerPoint thành công")
            return True
        except Exception as e:
            logger.error(f"Lỗi kết nối PowerPoint: {str(e)}")
            return False

    def download_image(self, image_url: str) -> Optional[Image.Image]:
        """
        Tải ảnh từ URL và trả về đối tượng PIL Image
        """
        logger.debug(f"Bắt đầu tải ảnh từ URL: {image_url}")
        try:
            # Tạo session với headers
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
            })

            # Tải ảnh
            logger.debug("Đang tải ảnh...")
            response = session.get(image_url, timeout=10, verify=False)
            response.raise_for_status()

            # Kiểm tra content type
            content_type = response.headers.get('Content-Type', '')
            logger.debug(f"Content-Type: {content_type}")
            if not content_type.startswith('image/'):
                logger.error(f"URL không trỏ đến ảnh: {content_type}")
                return None

            # Đọc ảnh với Pillow
            img = Image.open(BytesIO(response.content))
            
            # Chuyển đổi sang RGB nếu cần
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                logger.debug("Chuyển đổi ảnh sang RGB")
                img = img.convert('RGB')
                
            return img

        except Exception as e:
            logger.error(f"Lỗi tải ảnh: {str(e)}")
            return None

    def insert_image(self, image_url: str, mode: str = "insert", padding: int = 20) -> bool:
        """
        Chèn ảnh vào slide hiện tại được chọn
        """
        logger.debug("Bắt đầu chèn ảnh vào slide hiện tại")
        temp_file = None
        try:
            if not self.connect_to_powerpoint():
                logger.error("Không thể kết nối với PowerPoint")
                return False
                
            presentation = self.ppt.ActivePresentation
            if not presentation:
                logger.error("Không tìm thấy presentation đang mở")
                return False
            
            # Lấy slide hiện tại đang được chọn
            try:
                window = self.ppt.ActiveWindow
                if not window:
                    logger.error("Không tìm thấy cửa sổ PowerPoint đang mở")
                    return False
                    
                view = window.View
                if not view:
                    logger.error("Không thể lấy view hiện tại")
                    return False
                    
                slide = view.Slide
                if not slide:
                    logger.error("Không tìm thấy slide nào được chọn")
                    return False
                    
                logger.debug(f"Đã lấy được slide hiện tại (ID: {slide.SlideIndex})")
            except Exception as e:
                logger.error(f"Lỗi khi lấy slide hiện tại: {str(e)}")
                return False
            
            # Xử lý ảnh base64
            if image_url.startswith('data:image/'):
                logger.debug("Xử lý ảnh base64")
                # Tách phần dữ liệu base64
                header, encoded = image_url.split(",", 1)
                # Decode base64 thành bytes
                image_data = base64.b64decode(encoded)
                # Tạo đối tượng PIL Image từ bytes
                img = Image.open(BytesIO(image_data))
            # Xử lý URL thông thường
            elif image_url.startswith(('http://', 'https://')):
                logger.debug("Tải ảnh từ URL")
                img = self.download_image(image_url)
                if not img:
                    logger.error("Không thể tải ảnh từ URL")
                    return False
            else:
                try:
                    logger.debug("Mở file ảnh local")
                    img = Image.open(image_url)
                except Exception as e:
                    logger.error(f"Không thể mở file ảnh local: {str(e)}")
                    return False
            
            # Chuyển đổi sang RGB nếu cần
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                logger.debug("Chuyển đổi ảnh sang RGB")
                img = img.convert('RGB')
            
            # Lưu ảnh vào file tạm thời
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            temp_path = temp_file.name
            temp_file.close()
            
            logger.debug(f"Lưu ảnh vào file tạm: {temp_path}")
            img.save(temp_path, 'PNG')
            
            # Tính toán kích thước và vị trí
            slide_height = presentation.PageSetup.SlideHeight
            slide_width = presentation.PageSetup.SlideWidth
            
            # Chèn ảnh từ file
            logger.debug("Đang chèn ảnh từ file...")
            try:
                shape = slide.Shapes.AddPicture(
                    FileName=temp_path,
                    LinkToFile=False,
                    SaveWithDocument=True,
                    Left=padding,
                    Top=padding
                )
            except Exception as e:
                logger.error(f"Lỗi khi chèn ảnh từ file: {str(e)}")
                return False
            
            # Điều chỉnh kích thước và vị trí
            try:
                if mode == "insert":
                    shape.LockAspectRatio = True
                    shape.Width = slide_width - (padding * 2)
                    if shape.Height > (slide_height - (padding * 2)):
                        shape.Height = slide_height - (padding * 2)
                    
                    # Căn giữa
                    shape.Left = (slide_width - shape.Width) / 2
                    shape.Top = (slide_height - shape.Height) / 2
                    logger.debug("Đã căn chỉnh ảnh theo mode insert")
                else:  # mode == "crop"
                    shape.LockAspectRatio = False
                    shape.Width = slide_width - (padding * 2)
                    shape.Height = slide_height - (padding * 2)
                    logger.debug("Đã căn chỉnh ảnh theo mode crop")
            except Exception as e:
                logger.error(f"Lỗi khi điều chỉnh kích thước và vị trí ảnh: {str(e)}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Lỗi khi chèn ảnh: {str(e)}")
            return False
        finally:
            # Xóa file tạm nếu tồn tại
            if temp_file:
                try:
                    os.unlink(temp_file.name)
                except:
                    pass

    def process_command(self, command: Dict) -> Dict:
        """
        Xử lý lệnh từ API
        """
        logger.debug(f"Xử lý lệnh: {command}")
        try:
            action = command.get("action")
            
            if action == "insert_images":
                image_url = command.get("image_url")
                if not image_url:
                    logger.error("Thiếu URL ảnh")
                    return {"success": False, "error": "Thiếu URL ảnh"}
                    
                mode = command.get("mode", "insert")
                
                success = self.insert_image(
                    image_url=image_url,
                    mode=mode
                )
                
                if success:
                    logger.debug("Đã chèn ảnh thành công vào slide hiện tại")
                    return {
                        "success": True,
                        "message": "Đã chèn ảnh vào slide hiện tại"
                    }
                else:
                    logger.error("Không thể chèn ảnh")
                    return {
                        "success": False,
                        "error": "Không thể chèn ảnh"
                    }
            else:
                logger.error(f"Hành động không hợp lệ: {action}")
                return {
                    "success": False,
                    "error": f"Hành động không hợp lệ: {action}"
                }
                
        except Exception as e:
            logger.error(f"Lỗi xử lý lệnh: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

# Ví dụ sử dụng
if __name__ == "__main__":
    # Khởi tạo handler
    handler = PPTImageHandler()
    
    # Tạo lệnh mẫu
    command = {
        "action": "insert_images",
        "query": "japan temple",
        "num_images": 4,
        "slide_index": 1,
        "mode": "insert",
        "padding": 20
    }
    
    # Thực thi lệnh
    result = handler.process_command(command)
    print(result) 