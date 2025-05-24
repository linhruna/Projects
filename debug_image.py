import os
import base64
import requests
from dotenv import load_dotenv
from image_search import search_images, get_best_image

# Load environment variables
load_dotenv()

def test_image_search(query):
    """Test the image search functionality"""
    print(f"\n=== Testing image search for '{query}' ===")
    images = search_images(query)
    print(f"Found {len(images)} images")
    
    if images:
        print("\nFirst image details:")
        print(f"URL: {images[0]['url']}")
        print(f"Source: {images[0]['source']}")
        print(f"Size: {images[0]['width']}x{images[0]['height']}")
        return images[0]['url']
    return None

def test_image_base64_conversion(image_url):
    """Test converting an image to base64"""
    print(f"\n=== Testing base64 conversion for '{image_url}' ===")
    try:
        response = requests.get(image_url, timeout=15)
        response.raise_for_status()
        
        # Convert to base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        
        # Get size of base64 string
        size_kb = len(image_base64) / 1024
        print(f"Base64 conversion successful")
        print(f"Original image size: {len(response.content) / 1024:.2f} KB")
        print(f"Base64 string size: {size_kb:.2f} KB")
        
        if size_kb > 1024:
            print("WARNING: Base64 string is very large (>1MB), may cause issues")
        
        # Check content type
        content_type = response.headers.get('Content-Type', '')
        print(f"Content type: {content_type}")
        
        # First few characters of base64 string
        print(f"Base64 preview: {image_base64[:50]}...")
        
        return image_base64
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

if __name__ == "__main__":
    test_queries = [
        "mountain landscape",
        "business meeting",
        "technology innovation"
    ]
    
    # Test if API keys are set
    print("=== API Key Status ===")
    print(f"UNSPLASH_API_KEY: {'Set' if os.environ.get('UNSPLASH_API_KEY') else 'Not set'}")
    print(f"PIXABAY_API_KEY: {'Set' if os.environ.get('PIXABAY_API_KEY') else 'Not set'}")
    print(f"PEXELS_API_KEY: {'Set' if os.environ.get('PEXELS_API_KEY') else 'Not set'}")
    
    # Run tests
    for query in test_queries:
        image_url = test_image_search(query)
        if image_url:
            test_image_base64_conversion(image_url)
        print("\n" + "-"*50) 