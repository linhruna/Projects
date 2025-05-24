import os
import time
from collections import deque
from openai import OpenAI
from langchain.memory import ConversationBufferMemory
from ppt_image_handler import PPTImageHandler
import re
import argparse
from image_search import search_images

# Kiểm tra biến môi trường API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
CLIENT_AVAILABLE = False

# Khởi tạo client OpenAI với base_url trỏ đến Groq nếu có API key
if GROQ_API_KEY:
    try:
        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=GROQ_API_KEY
        )
        CLIENT_AVAILABLE = True
    except Exception as e:
        print(f"Lỗi khi tạo client Groq: {e}")
else:
    print("Cảnh báo: GROQ_API_KEY không được thiết lập. Chức năng chat sẽ không hoạt động.")

# Mô hình bạn muốn dùng (Groq hỗ trợ Llama 3)
MODEL_NAME = "meta-llama/llama-4-maverick-17b-128e-instruct"  # hoặc "llama-3.3-70b-versatile"

# Cài đặt sliding window cho lịch sử hội thoại
WINDOW_SIZE = 10
messages = deque(maxlen=WINDOW_SIZE * 2)  # user + assistant messages

# Bộ nhớ LangChain (nếu bạn cần dùng cho logic khác)
memory = ConversationBufferMemory(return_messages=True)

# Khởi tạo PowerPoint handler
ppt_handler = PPTImageHandler()

# Gọi mô hình qua OpenAI-compatible API
def get_groq_response(messages):
    if not CLIENT_AVAILABLE:
        return "Chat không khả dụng vì không có API key hoặc client bị lỗi.", 0
    
    try:
        start_time = time.time()
        chat_completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7
        )
        end_time = time.time()
        response_time = end_time - start_time
        return chat_completion.choices[0].message.content, response_time
    except Exception as e:
        return f"❌ Lỗi khi gọi API: {e}", 0

def process_image_command(command):
    """Xử lý các lệnh liên quan đến ảnh"""
    # Pattern 1: tìm N ảnh về X
    match = re.match(r"tìm (\d+) ảnh về (.+)", command.lower())
    if match:
        num_images = int(match.group(1))
        query = match.group(2)
        result = ppt_handler.process_command({
            "action": "insert_images",
            "query": query,
            "num_images": num_images,
            "mode": "insert"
        })
        return result["message"]
        
    # Pattern 2: chèn N ảnh X vào slide Y
    match = re.match(r"chèn (\d+) ảnh (.+) vào slide (\d+)", command.lower())
    if match:
        num_images = int(match.group(1))
        query = match.group(2)
        slide_index = int(match.group(3))
        result = ppt_handler.process_command({
            "action": "insert_images",
            "query": query,
            "num_images": num_images,
            "slide_index": slide_index,
            "mode": "insert"
        })
        return result["message"]
        
    # Pattern 3: tìm và chèn N ảnh X (mode)
    match = re.match(r"tìm và chèn (\d+) ảnh (.+) \((\w+)\)", command.lower())
    if match:
        num_images = int(match.group(1))
        query = match.group(2)
        mode = match.group(3)
        result = ppt_handler.process_command({
            "action": "insert_images",
            "query": query,
            "num_images": num_images,
            "mode": mode
        })
        return result["message"]
    
    return None

# Chạy vòng lặp chat
def run_chat():
    global memory, messages
    
    if not CLIENT_AVAILABLE:
        print("🚫 Chat không khả dụng vì không có API key.")
        return
    
    print("🤖 Bắt đầu chat với Groq (OpenAI-compatible) + LangChain (gõ 'exit' để thoát):")
    print("\nCác lệnh xử lý ảnh:")
    print("1. tìm N ảnh về X")
    print("2. chèn N ảnh X vào slide Y")
    print("3. tìm và chèn N ảnh X (insert/crop)")
    
    while True:
        user_input = input("\n👤 Bạn: ").strip()
        if user_input.lower() == "exit":
            print("👋 Kết thúc hội thoại.")
            import gc
            messages.clear()
            del messages
            del memory
            gc.collect()
            print("🧹 Đã giải phóng bộ nhớ.")
            break

        # Thử xử lý lệnh ảnh trước
        image_response = process_image_command(user_input)
        if image_response:
            print(f"🤖 Bot: {image_response}")
            continue

        # Nếu không phải lệnh ảnh, xử lý như chat bình thường
        memory.chat_memory.add_user_message(user_input)
        messages.append({"role": "user", "content": user_input})

        bot_reply, response_time = get_groq_response(list(messages))
        print(f"⏱ Thời gian phản hồi: {response_time:.2f} giây")
        print(f"🤖 Bot: {bot_reply}")

        memory.chat_memory.add_ai_message(bot_reply)
        messages.append({"role": "assistant", "content": bot_reply})

def handle_search_command(query: str, num_images: int = 5):
    """Xử lý lệnh tìm kiếm ảnh"""
    print(f"🔍 Đang tìm {num_images} ảnh về '{query}'...")
    
    images = search_images(query, per_page=num_images)
    if not images:
        print("❌ Không tìm thấy ảnh phù hợp")
        return
        
    print(f"✅ Đã tìm thấy {len(images)} ảnh:")
    for i, image in enumerate(images, 1):
        print(f"{i}. {image['url']}")

def handle_insert_command(query: str, slide_index: int, num_images: int = 1, mode: str = "insert"):
    """Xử lý lệnh chèn ảnh vào slide"""
    print(f"🔍 Đang tìm {num_images} ảnh về '{query}'...")
    
    images = search_images(query, per_page=num_images)
    if not images:
        print("❌ Không tìm thấy ảnh phù hợp")
        return
        
    print(f"📎 Đang chèn {len(images)} ảnh vào slide {slide_index}...")
    
    handler = PPTImageHandler()
    for image in images:
        result = handler.process_command({
            "action": "insert_images",
            "image_url": image['url'],
            "slide_index": slide_index,
            "mode": mode
        })
        
        if result["success"]:
            print(f"✅ {result['message']}")
        else:
            print(f"❌ {result['error']}")

def main():
    parser = argparse.ArgumentParser(description="PowerPoint Image Assistant")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Lệnh tìm kiếm ảnh
    search_parser = subparsers.add_parser("search", help="Tìm kiếm ảnh")
    search_parser.add_argument("query", help="Từ khóa tìm kiếm")
    search_parser.add_argument("-n", "--num", type=int, default=5, help="Số lượng ảnh (mặc định: 5)")
    
    # Lệnh chèn ảnh
    insert_parser = subparsers.add_parser("insert", help="Chèn ảnh vào slide")
    insert_parser.add_argument("query", help="Từ khóa tìm kiếm")
    insert_parser.add_argument("slide", type=int, help="Số thứ tự slide")
    insert_parser.add_argument("-n", "--num", type=int, default=1, help="Số lượng ảnh (mặc định: 1)")
    insert_parser.add_argument("-m", "--mode", choices=["insert", "crop"], default="insert",
                             help="Chế độ chèn ảnh (mặc định: insert)")
    
    args = parser.parse_args()
    
    if args.command == "search":
        handle_search_command(args.query, args.num)
    elif args.command == "insert":
        handle_insert_command(args.query, args.slide, args.num, args.mode)
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 