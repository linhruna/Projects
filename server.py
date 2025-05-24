import os
import base64
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
from image_search import search_images
from langchain_image_tool import search_images_with_langchain
from ppt_image_handler import PPTImageHandler

# Try to import local image generator
try:
    from local_image_generator import create_placeholder_image
    LOCAL_GENERATOR_AVAILABLE = True
except ImportError:
    LOCAL_GENERATOR_AVAILABLE = False

# Import hàm chat từ main.py
from main import get_groq_response

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PowerPoint handler
ppt_handler = PPTImageHandler()

# Models
class ImageSearchRequest(BaseModel):
    query: str
    source: str = None  # Thêm tham số nguồn, mặc định là None (tìm từ tất cả các nguồn)

class ImageUrlRequest(BaseModel):
    url: str
    
class ChatRequest(BaseModel):
    message: str
    history: list = []

class PowerPointImageRequest(BaseModel):
    action: str = "insert_images"
    image_url: str
    query: str = None
    num_images: int = 5
    slide_index: int = 1
    mode: str = "insert"
    padding: int = 20

# Endpoints
@app.get("/")
def read_root():
    return {"message": "PowerPoint Agent API is running"}

@app.post("/search_images")
async def api_search_images(request: ImageSearchRequest):
    try:
        # Gọi hàm search_images với tham số source nếu được cung cấp
        images = search_images(request.query, per_page=10, source=request.source)
        
        # Kiểm tra xem có hình ảnh nào không
        if images and len(images) > 0:
            # Kiểm tra xem image[0] có phải là hình ảnh base64 cục bộ không
            first_image = images[0]
            if 'is_base64' in first_image and first_image['is_base64']:
                # Đã là base64, trả về luôn
                return {"success": True, "images": images}
                
            # Thử chuyển đổi hình ảnh đầu tiên sang base64 để tránh CORS
            try:
                image_url = first_image['url']
                base64_result = await get_image_as_base64_internal(image_url)
                if base64_result["success"]:
                    # Cập nhật URL với base64
                    first_image['url'] = base64_result["base64"]
                    first_image['is_base64'] = True
            except Exception as e:
                print(f"Không thể chuyển đổi hình ảnh sang base64: {str(e)}")
                # Vẫn giữ URL ban đầu
                
            return {"success": True, "images": images}
        else:
            # Nếu không có kết quả, tạo một hình ảnh cục bộ
            if LOCAL_GENERATOR_AVAILABLE:
                try:
                    base64_img = create_placeholder_image(f"Không tìm thấy hình ảnh cho: {request.query}")
                    placeholder_image = {
                        "url": base64_img,
                        "thumb": base64_img,
                        "source": "LocalGenerator",
                        "width": 800,
                        "height": 600,
                        "description": f"Hình ảnh được tạo cho '{request.query}'",
                        "is_base64": True
                    }
                    return {"success": True, "images": [placeholder_image]}
                except Exception as e:
                    print(f"Lỗi khi tạo hình ảnh cục bộ: {str(e)}")
                    
            return {"success": False, "error": "Không tìm thấy hình ảnh"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/insert_image_langchain")
async def api_insert_image_langchain(request: ImageSearchRequest):
    try:
        image_url = search_images_with_langchain(request.query)
        if image_url:
            # Check if it's already a base64 image
            if image_url.startswith('data:image/'):
                return {"success": True, "url": image_url}
            else:
                # Try to convert to base64
                try:
                    base64_result = await get_image_as_base64_internal(image_url)
                    if base64_result["success"]:
                        return {"success": True, "url": base64_result["base64"]}
                except:
                    # If conversion fails, generate a local image
                    if LOCAL_GENERATOR_AVAILABLE:
                        try:
                            base64_img = create_placeholder_image(f"Image for: {request.query}")
                            return {"success": True, "url": base64_img}
                        except:
                            pass
                            
                # Return the original URL as a last resort
                return {"success": True, "url": image_url}
        else:
            return {"success": False, "error": "No suitable image found"}
    except Exception as e:
        return {"success": False, "error": str(e)}

async def get_image_as_base64_internal(url):
    """Internal function to get image as base64"""
    try:
        print(f"Đang tải hình ảnh từ URL: {url}")
        
        # If already a base64 image
        if url.startswith('data:image/'):
            return {"success": True, "base64": url}
            
        # Get image from URL with timeout and various headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        }
        
        # Try to get the image
        response = requests.get(
            url, 
            timeout=15, 
            headers=headers,
            allow_redirects=True,
            stream=True
        )
        response.raise_for_status()
        
        # Convert to base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        
        # Determine content type
        content_type = response.headers.get('Content-Type', 'image/jpeg')
        if not content_type.startswith('image/'):
            content_type = 'image/jpeg'  # Đảm bảo có content type đúng
        
        print(f"Chuyển đổi thành công, dung lượng: {len(response.content)} bytes")
        
        # Return base64 image with data URL prefix
        return {
            "success": True,
            "base64": f"data:{content_type};base64,{image_base64}"
        }
    except Exception as e:
        print(f"Lỗi xử lý hình ảnh: {str(e)}")
        
        # Try to generate a local image instead
        if LOCAL_GENERATOR_AVAILABLE:
            try:
                base64_img = create_placeholder_image("Image could not be loaded")
                return {"success": True, "base64": base64_img, "is_fallback": True}
            except Exception as local_error:
                print(f"Error creating local image: {local_error}")
                
        return {"success": False, "error": str(e)}

@app.post("/get_image_as_base64")
async def get_image_as_base64(request: ImageUrlRequest):
    return await get_image_as_base64_internal(request.url)

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Chuẩn bị lịch sử chat theo định dạng cần thiết cho Groq API
        messages = []
        for msg in request.history:
            messages.append(msg)
        
        # Thêm tin nhắn hiện tại
        messages.append({"role": "user", "content": request.message})
        
        # Gọi API chat
        response_text, response_time = get_groq_response(messages)
        
        # Thêm phản hồi vào lịch sử
        messages.append({"role": "assistant", "content": response_text})
        
        return {
            "success": True,
            "response": response_text,
            "response_time": f"{response_time:.2f}s",
            "history": messages
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/powerpoint/images")
async def handle_powerpoint_images(request: PowerPointImageRequest):
    """
    Xử lý yêu cầu chèn ảnh vào PowerPoint
    """
    try:
        print(f"Nhận yêu cầu chèn ảnh: {request.dict()}")
        
        # Kiểm tra URL hình ảnh
        if not request.image_url:
            raise HTTPException(status_code=400, detail="Thiếu URL hình ảnh")
            
        # Kiểm tra xem có phải base64 không
        is_base64 = request.image_url.startswith('data:image/')
        print(f"URL hình ảnh là base64: {is_base64}")
        
        # Xử lý yêu cầu
        result = ppt_handler.process_command(request.dict())
        print(f"Kết quả xử lý: {result}")
        
        if not result.get('success'):
            error_msg = result.get('error', 'Không thể chèn hình ảnh')
            print(f"Lỗi từ PPT handler: {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
            
        return result
    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        error_msg = str(e)
        print(f"Lỗi khi xử lý yêu cầu chèn ảnh: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

# Run the server
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True) 