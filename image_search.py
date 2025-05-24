import os
import requests
import random
import urllib.parse
import re
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Import our local placeholder generator
try:
    from local_image_generator import create_placeholder_image
    LOCAL_GENERATOR_AVAILABLE = True
except ImportError:
    LOCAL_GENERATOR_AVAILABLE = False

# Load environment variables
load_dotenv()

# API Keys
UNSPLASH_API_KEY = os.environ.get("UNSPLASH_API_KEY", "")
PIXABAY_API_KEY = os.environ.get("PIXABAY_API_KEY", "")
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")

def search_unsplash(query, per_page=5):
    """Search images on Unsplash"""
    if not UNSPLASH_API_KEY:
        return []
    
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://api.unsplash.com/search/photos?query={encoded_query}&per_page={per_page}"
        headers = {"Authorization": f"Client-ID {UNSPLASH_API_KEY}"}
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if "results" in data:
            return [
                {
                    "url": photo["urls"]["regular"],
                    "thumb": photo["urls"]["thumb"],
                    "source": "Unsplash",
                    "width": photo["width"],
                    "height": photo["height"],
                    "description": photo["description"] or photo["alt_description"] or query
                }
                for photo in data["results"]
            ]
    except Exception as e:
        print(f"Unsplash error: {str(e)}")
    
    return []

def search_pixabay(query, per_page=5):
    """Search images on Pixabay"""
    if not PIXABAY_API_KEY:
        return []
    
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={encoded_query}&image_type=photo&per_page={per_page}"
        
        response = requests.get(url)
        data = response.json()
        
        if "hits" in data:
            return [
                {
                    "url": photo["largeImageURL"],
                    "thumb": photo["previewURL"],
                    "source": "Pixabay",
                    "width": photo["imageWidth"],
                    "height": photo["imageHeight"],
                    "description": query
                }
                for photo in data["hits"]
            ]
    except Exception as e:
        print(f"Pixabay error: {str(e)}")
    
    return []

def search_pexels(query, per_page=5):
    """Search images on Pexels"""
    if not PEXELS_API_KEY:
        return []
    
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://api.pexels.com/v1/search?query={encoded_query}&per_page={per_page}"
        headers = {"Authorization": PEXELS_API_KEY}
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if "photos" in data:
            return [
                {
                    "url": photo["src"]["large"],
                    "thumb": photo["src"]["medium"],
                    "source": "Pexels",
                    "width": photo["width"],
                    "height": photo["height"],
                    "description": photo.get("alt", query)
                }
                for photo in data["photos"]
            ]
    except Exception as e:
        print(f"Pexels error: {str(e)}")
    
    return []

def search_pexels_direct(query, per_page=5):
    """Search images on Pexels directly without API key"""
    try:
        # Format the query for the URL
        formatted_query = query.replace(' ', '%20')
        url = f"https://www.pexels.com/vi-vn/tim-kiem/{formatted_query}/"
        
        # Use headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        }
        
        print(f"Searching Pexels at URL: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"Pexels returned status code: {response.status_code}")
            return []
        
        # Parse the response using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all article elements that contain images
        articles = soup.find_all(['article', 'a'], class_=['photo-item', 'PhotoItem_photoItemLink'])
        
        results = []
        count = 0
        
        print(f"Found {len(articles)} potential image containers")
        
        for article in articles:
            if count >= per_page:
                break
            
            # Try different ways to find the image
            img = article.find('img', {'src': True, 'data-image-width': True})
            if not img:
                img = article.find('img', {'src': True})
            
            if img:
                img_url = img.get('src', '')
                if not img_url:
                    continue
                    
                # Convert to high resolution version
                if "images.pexels.com" in img_url:
                    # Remove size parameters to get full resolution
                    img_url = re.sub(r'\?.*$', '', img_url)
                    
                    # Get image dimensions
                    width = img.get('data-image-width', 800)
                    height = img.get('data-image-height', 600)
                    try:
                        width = int(width)
                        height = int(height)
                    except:
                        width = 800
                        height = 600
                    
                    # Get photographer info
                    photographer = img.get('alt', '').replace('Photo by ', '')
                    photographer = photographer.split(' on')[0] if ' on' in photographer else photographer
                    
                    print(f"Found image: {img_url}")
                    
                    results.append({
                        "url": img_url,
                        "thumb": img_url,
                        "source": "Pexels",
                        "width": width,
                        "height": height,
                        "description": f"{query} by {photographer}",
                        "photographer": photographer
                    })
                    count += 1
        
        print(f"Successfully found {len(results)} images")
        return results
    except Exception as e:
        print(f"Pexels direct search error: {str(e)}")
        return []

def get_placeholder_image(query, width=800, height=600):
    """Generate a placeholder image"""
    # Use local generator if available
    if LOCAL_GENERATOR_AVAILABLE:
        try:
            # Create local base64 image
            base64_img = create_placeholder_image(f"Image for: {query}", width, height)
            
            return {
                "url": base64_img,  # Already contains the data:image/jpeg;base64 prefix
                "thumb": base64_img,
                "source": "LocalGenerator",
                "width": width,
                "height": height,
                "description": f"Generated image for {query}",
                "is_base64": True
            }
        except Exception as e:
            print(f"Local generator error: {str(e)}")
    
    # Fallback to placeholder.com (which probably won't work)
    try:
        encoded_text = urllib.parse.quote(f"No image found for: {query}")
        return {
            "url": f"https://via.placeholder.com/{width}x{height}?text={encoded_text}",
            "thumb": f"https://via.placeholder.com/150x150?text={encoded_text}",
            "source": "Placeholder",
            "width": width,
            "height": height,
            "description": f"Placeholder for {query}"
        }
    except Exception:
        # Last resort fallback - hardcoded data URI for a simple colored rectangle
        color = "%23" + "".join([random.choice("0123456789ABCDEF") for _ in range(6)])
        return {
            "url": f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}'><rect width='100%' height='100%' fill='{color}'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='white' text-anchor='middle'>{query}</text></svg>",
            "thumb": f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='100%' height='100%' fill='{color}'/></svg>",
            "source": "EmergencyFallback",
            "width": width,
            "height": height,
            "description": query,
            "is_base64": True
        }

def search_images(query, per_page=5, source=None):
    """Search images from multiple sources
    
    Args:
        query (str): The search query
        per_page (int, optional): Number of images to return per source. Defaults to 5.
        source (str, optional): Specific source to search from (unsplash, pexels, pixabay). Defaults to None (all sources).
    
    Returns:
        list: List of image objects
    """
    if not query or len(query.strip()) == 0:
        return [get_placeholder_image("Empty query")]
    
    # Get images from selected sources
    results = []
    
    try:
        # Try using Pexels API first
        if source == "pexels" or source is None:
            pexels_images = search_pexels(query, per_page)
            if pexels_images:
                results.extend(pexels_images)
            else:
                # Fallback to direct search only if API fails
                pexels_images = search_pexels_direct(query, per_page)
                results.extend(pexels_images)
            
        # If no results, create placeholder
        if not results:
            results.append(get_placeholder_image(query))
            
        return results
    except Exception as e:
        print(f"Error in search_images: {str(e)}")
        # Return at least one placeholder image
        return [get_placeholder_image(query)]

def get_best_image(query):
    """Get the best image for a query"""
    images = search_images(query, per_page=1)
    return images[0]["url"] if images else None

# Test function
if __name__ == "__main__":
    query = "beautiful landscape"
    images = search_images(query)
    
    print(f"Found {len(images)} images for query '{query}':")
    for i, image in enumerate(images, start=1):
        print(f"{i}. {image['source']}: {image['url']} ({image['width']}x{image['height']})") 