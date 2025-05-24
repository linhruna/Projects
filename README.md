# PowerPoint Agent with LangChain Image Search

This add-in for PowerPoint integrates LangChain for enhanced image search capabilities, allowing users to easily find and insert images directly into their presentations through natural language commands.

## Features

- Natural language interface to interact with PowerPoint
- Create new slides with titles
- Insert text into slides
- Count slides and get slide information
- Search and insert images from the web:
  - Basic search via Unsplash (no API key required)
  - Advanced search via LangChain + Google Custom Search (requires API keys)
  - Support for specifying image size, type, and other parameters
  - Option to optimize search queries using OpenAI

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Configure environment variables for advanced image search (optional)
4. Run `npm start` to start the development server
5. Sideload the add-in into PowerPoint

## Environment Variables

For advanced image search capabilities with LangChain, create a `.env` file in the root directory with the following variables:

```
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_custom_search_engine_id
OPENAI_API_KEY=your_openai_api_key
```

- Get a Google API key from [Google Cloud Console](https://console.cloud.google.com/)
- Create a Custom Search Engine ID at [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/create)
- Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)

## Usage Instructions

### Basic Commands

- **Create a slide**: "tạo slide [title]"
- **Insert text**: "thêm text [content]"
- **Count slides**: "số slide"
- **Slide information**: "thông tin slide"

### Image Search Commands

#### Basic Image Search
- "tìm ảnh [query]" - Searches for images using Unsplash
- "chèn ảnh [query]" - Searches and inserts an image

#### Advanced Image Search with LangChain
- "tìm ảnh langchain [query]" - Uses LangChain for enhanced search
- "tìm ảnh nâng cao [query]" - Same as above

#### Image Search Options
- "tìm ảnh [ảnh lớn/ảnh nhỏ/ảnh vừa] [query]" - Specifies image size
- "tìm ảnh [ảnh chụp/clip art/line drawing] [query]" - Specifies image type
- "tìm ảnh khuôn mặt [query]" - Searches for images with faces

#### Direct URL Insertion
- "chèn ảnh [URL]" - Inserts an image from a specific URL

## Troubleshooting

If you encounter errors with image insertion:
1. Ensure you have the necessary API keys set up for advanced features
2. Some image URLs may be restricted and won't work for insertion
3. The Office JavaScript API has limitations for inserting images from certain domains

## Development

- `npm run build` - Build the production version
- `npm run lint` - Run ESLint checks
- `npm run start:web` - Start development server for web version 