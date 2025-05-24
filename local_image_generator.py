from PIL import Image, ImageDraw, ImageFont
import base64
import io
import os
import random

def create_placeholder_image(text, width=800, height=600, format='JPEG'):
    """Create a placeholder image with text and return as base64"""
    # Create a new image with a solid background
    colors = [
        (52, 152, 219),  # Blue
        (46, 204, 113),  # Green
        (155, 89, 182),  # Purple
        (52, 73, 94),    # Dark Gray
        (26, 188, 156)   # Turquoise
    ]
    
    bg_color = random.choice(colors)
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to use a nice font if available
        font_paths = [
            os.path.join(os.environ.get('WINDIR', ''), 'Fonts', 'arial.ttf'),
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/System/Library/Fonts/Helvetica.ttc'
        ]
        
        font = None
        for path in font_paths:
            if os.path.exists(path):
                try:
                    font = ImageFont.truetype(path, 36)
                    break
                except:
                    pass
                
        if font is None:
            # Fallback to default font
            font = ImageFont.load_default()
            
    except Exception:
        # If everything fails, use default
        font = ImageFont.load_default()
    
    # Make sure text isn't too long
    if len(text) > 30:
        text = text[:27] + "..."
    
    # Calculate text position for center alignment - use getbbox in newer PIL versions
    try:
        # New method for PIL >= 8.0.0
        bbox = font.getbbox(text)
        text_width, text_height = bbox[2] - bbox[0], bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older PIL versions
        try:
            text_width, text_height = draw.textsize(text, font=font)
        except:
            # Default values if all fails
            text_width, text_height = 300, 30
    
    position = ((width - text_width) // 2, (height - text_height) // 2)
    
    # Draw text with a slight shadow for better visibility
    shadow_color = tuple(max(0, c - 50) for c in bg_color)
    draw.text((position[0] + 2, position[1] + 2), text, font=font, fill=shadow_color)
    draw.text(position, text, font=font, fill="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return f"data:image/{format.lower()};base64,{img_str}"

# Example usage
if __name__ == "__main__":
    # Test with a sample query
    sample_text = "Sample Image for PowerPoint"
    base64_image = create_placeholder_image(sample_text)
    print(f"Base64 image created. Length: {len(base64_image)}")
    print(f"Preview: {base64_image[:50]}...")
    
    # Optionally save to file to verify
    with open("sample_image.html", "w") as f:
        f.write(f"<img src='{base64_image}' />")
    print("Created sample_image.html for preview") 