# Image Search API Documentation

This document describes the API endpoints for the PowerPoint Agent's image search functionality.

## Base URL

```
http://127.0.0.1:8000
```

## Authentication

Currently, the API does not require authentication for local development. API keys for image services should be set in your environment variables or .env file.

Required API keys:
- `UNSPLASH_API_KEY`: For Unsplash image search
- `PIXABAY_API_KEY`: For Pixabay image search
- `PEXELS_API_KEY`: For Pexels image search
- Either `GROQ_API_KEY` or `OPENAI_API_KEY`: For LangChain image search enhancement

## Endpoints

### Health Check

```
GET /
```

Returns a simple message indicating that the API is running.

**Response:**
```json
{
  "message": "PowerPoint Agent API is running"
}
```

### Search Images

```
POST /search_images
```

Search for images across multiple sources (Unsplash, Pixabay, Pexels).

**Request Body:**
```json
{
  "query": "beautiful sunset"
}
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "thumb": "https://example.com/thumb.jpg",
      "source": "Unsplash",
      "width": 1920,
      "height": 1080,
      "description": "Beautiful sunset over mountains"
    },
    // More images...
  ]
}
```

### Search Image with LangChain

```
POST /insert_image_langchain
```

Uses LangChain to enhance the search query and find the most relevant image.

**Request Body:**
```json
{
  "query": "show me a picture of a beautiful sunset"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/best-sunset-image.jpg"
}
```

### Get Image as Base64

```
POST /get_image_as_base64
```

Converts an image URL to base64 format for direct insertion into PowerPoint.

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAoHBwgHBg..."
}
```

## Error Handling

All endpoints return a JSON response with a `success` field indicating whether the request was successful. If an error occurs, the response will include an `error` field with a description of the error.

**Example error response:**
```json
{
  "success": false,
  "error": "No images found for the given query"
}
```

## Usage Examples

### Example 1: Search for images of mountains

**Request:**
```bash
curl -X POST http://127.0.0.1:8000/search_images \
  -H "Content-Type: application/json" \
  -d '{"query": "mountains"}'
```

### Example 2: Use LangChain to find the best image

**Request:**
```bash
curl -X POST http://127.0.0.1:8000/insert_image_langchain \
  -H "Content-Type: application/json" \
  -d '{"query": "show me a professional business meeting"}'
```

### Example 3: Convert an image URL to base64

**Request:**
```bash
curl -X POST http://127.0.0.1:8000/get_image_as_base64 \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg"}'
``` 