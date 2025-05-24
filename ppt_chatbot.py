from ppt_image_handler import PPTImageHandler
import re

class PPTChatbot:
    def __init__(self):
        """Khởi tạo chatbot"""
        self.image_handler = PPTImageHandler()
        
    def process_message(self, message):
        """
        Xử lý tin nhắn từ người dùng
        
        Args:
            message: Nội dung tin nhắn
            
        Returns:
            str: Phản hồi cho người dùng
        """
        # Kiểm tra các pattern phổ biến
        
        # Pattern 1: tìm N ảnh về X
        match = re.match(r"tìm (\d+) ảnh về (.+)", message.lower())
        if match:
            num_images = int(match.group(1))
            query = match.group(2)
            return self._handle_image_search(query, num_images)
            
        # Pattern 2: chèn N ảnh X vào slide Y
        match = re.match(r"chèn (\d+) ảnh (.+) vào slide (\d+)", message.lower())
        if match:
            num_images = int(match.group(1))
            query = match.group(2)
            slide_index = int(match.group(3))
            return self._handle_image_insert(query, num_images, slide_index)
            
        # Pattern 3: tìm và chèn N ảnh X (mode)
        match = re.match(r"tìm và chèn (\d+) ảnh (.+) \((\w+)\)", message.lower())
        if match:
            num_images = int(match.group(1))
            query = match.group(2)
            mode = match.group(3)
            return self._handle_image_search_and_insert(query, num_images, mode=mode)
        
        return "Tôi không hiểu yêu cầu. Bạn có thể thử các lệnh sau:\n" + \
               "1. tìm N ảnh về X\n" + \
               "2. chèn N ảnh X vào slide Y\n" + \
               "3. tìm và chèn N ảnh X (insert/crop)"
    
    def _handle_image_search(self, query, num_images=5):
        """Xử lý lệnh tìm ảnh"""
        command = {
            "action": "insert_images",
            "query": query,
            "num_images": num_images,
            "slide_index": 1  # Mặc định slide 1
        }
        
        result = self.image_handler.process_command(command)
        return result["message"]
    
    def _handle_image_insert(self, query, num_images, slide_index):
        """Xử lý lệnh chèn ảnh vào slide cụ thể"""
        command = {
            "action": "insert_images",
            "query": query,
            "num_images": num_images,
            "slide_index": slide_index
        }
        
        result = self.image_handler.process_command(command)
        return result["message"]
    
    def _handle_image_search_and_insert(self, query, num_images, mode="insert"):
        """Xử lý lệnh tìm và chèn ảnh với mode cụ thể"""
        command = {
            "action": "insert_images",
            "query": query,
            "num_images": num_images,
            "mode": mode
        }
        
        result = self.image_handler.process_command(command)
        return result["message"]

def main():
    """Hàm chạy chatbot"""
    chatbot = PPTChatbot()
    
    print("🤖 Chào mừng bạn! Tôi có thể giúp bạn tìm và chèn ảnh vào PowerPoint.")
    print("Gõ 'exit' để thoát.")
    
    while True:
        message = input("\n👤 Bạn: ")
        
        if message.lower() == 'exit':
            print("🤖 Tạm biệt!")
            break
            
        response = chatbot.process_message(message)
        print(f"🤖 Bot: {response}")

if __name__ == "__main__":
    main() 