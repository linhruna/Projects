import os
import json
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import HumanMessage, AIMessage
from image_search import search_images, get_best_image

# Try to import ChatOpenAI if available
try:
    from langchain_openai import ChatOpenAI
    LANGCHAIN_OPENAI_AVAILABLE = True
except ImportError:
    LANGCHAIN_OPENAI_AVAILABLE = False
    print("Warning: langchain_openai not available, using simplified image search")

# Load environment variables
load_dotenv()

# Initialize models with environment variables
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Check if any API keys are available
LANGUAGE_MODEL_AVAILABLE = False
llm = None

# Configure LangChain with appropriate API key if available
if LANGCHAIN_OPENAI_AVAILABLE:
    if GROQ_API_KEY:
        try:
            # Use Groq via OpenAI compatible client
            llm = ChatOpenAI(
                api_key=GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                model_name="meta-llama/llama-4-maverick-17b-128e-instruct",
                temperature=0.7
            )
            LANGUAGE_MODEL_AVAILABLE = True
            print("Using Groq API for image search enhancements")
        except Exception as e:
            print(f"Error configuring Groq API: {str(e)}")
            
    if not LANGUAGE_MODEL_AVAILABLE and OPENAI_API_KEY:
        try:
            # Use OpenAI directly
            llm = ChatOpenAI(
                api_key=OPENAI_API_KEY, 
                model_name="gpt-4o",
                temperature=0.7
            )
            LANGUAGE_MODEL_AVAILABLE = True
            print("Using OpenAI API for image search enhancements")
        except Exception as e:
            print(f"Error configuring OpenAI API: {str(e)}")

if not LANGUAGE_MODEL_AVAILABLE:
    print("No language model available. Using basic image search without enhancements.")

# Generate effective search query for finding images
def generate_image_search_query(user_query):
    """Generate an effective search query for image APIs based on user input"""
    if not LANGUAGE_MODEL_AVAILABLE:
        # Simple keyword extraction for search if no LLM available
        query = user_query.lower()
        
        # Remove common stop words
        stop_words = ["a", "an", "the", "is", "are", "in", "with", "for", "of", "to", "find", "image", "picture", "photo"]
        clean_words = [word for word in query.split() if word not in stop_words]
        
        if clean_words:
            return " ".join(clean_words)
        return user_query  # Return original if nothing left after cleanup
    
    # Use LLM if available
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an AI specialized in converting user requests into effective image search queries.
Your task is to analyze the user's request and generate the most relevant search terms that will return high-quality, 
relevant images from stock photo services. Focus on the main subject and important visual elements.

Output ONLY the search query text without any explanation, quotes or additional context.
The output should be concise (1-5 words) and directly usable as a search term."""),
        ("human", "{input}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"input": user_query})
    return result.strip()

# Analyze image search results and select the best one
def select_best_image_from_results(user_query, image_results):
    """Use LangChain to select the best image from search results"""
    if not LANGUAGE_MODEL_AVAILABLE or not image_results:
        # Return the first image if no LLM available
        return image_results[0]["url"] if image_results else None
    
    try:
        # Convert results to JSON string for the prompt
        results_json = json.dumps(image_results, indent=2)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an image selection assistant. Given a user's query and a list of image search results, 
select the SINGLE best image that matches the query's intent and context. Consider image source, quality, and relevance. 
Output ONLY the direct URL of the best image, with no additional text or explanation."""),
            ("human", f"User Query: {user_query}\nImage Results: {results_json}")
        ])
        
        chain = prompt | llm | StrOutputParser()
        result = chain.invoke({})
        return result.strip()
    except Exception as e:
        print(f"Error in select_best_image_from_results: {str(e)}")
        # Fallback to the first image
        return image_results[0]["url"] if image_results else None

# Main function to search for images using LangChain
def search_images_with_langchain(user_query):
    """Search for images using LangChain to enhance the query and select results"""
    try:
        # Generate an optimized search query if possible
        if LANGUAGE_MODEL_AVAILABLE:
            enhanced_query = generate_image_search_query(user_query)
            print(f"Original query: '{user_query}' → Enhanced: '{enhanced_query}'")
        else:
            enhanced_query = user_query
            print(f"Using original query: '{user_query}' (no language model available)")
        
        # Search for images using the query
        image_results = search_images(enhanced_query)
        
        # If we got results
        if image_results and len(image_results) > 0:
            # If only one result or placeholder, return it directly
            if len(image_results) == 1 or image_results[0]["source"] == "Placeholder":
                return image_results[0]["url"]
                
            # Otherwise, try to select the best image
            if LANGUAGE_MODEL_AVAILABLE:
                try:
                    best_url = select_best_image_from_results(user_query, image_results)
                    
                    # Validate the URL exists in our results
                    valid_urls = [img["url"] for img in image_results]
                    if best_url in valid_urls:
                        return best_url
                except Exception as e:
                    print(f"Error selecting best image: {str(e)}")
            
            # Fallback: return the first image
            return image_results[0]["url"]
        else:
            # No results found
            return None
            
    except Exception as e:
        print(f"Error in search_images_with_langchain: {str(e)}")
        # Fallback to basic image search
        return get_best_image(user_query)

# Test function
if __name__ == "__main__":
    test_queries = [
        "a beautiful sunset over mountains",
        "happy children playing in a park",
        "modern office workspace",
    ]
    
    for query in test_queries:
        print(f"\nTesting with query: '{query}'")
        image_url = search_images_with_langchain(query)
        print(f"Result: {image_url}") 