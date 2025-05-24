import requests
import xml.etree.ElementTree as ET
import html
import re

def get_vnexpress_news(category='thoi-su'):
    """
    Lấy tin tức từ RSS feed của VnExpress
    
    Các category phổ biến:
    - thoi-su: Thời sự
    - the-gioi: Thế giới
    - kinh-doanh: Kinh doanh
    - giai-tri: Giải trí
    - the-thao: Thể thao
    - phap-luat: Pháp luật
    - giao-duc: Giáo dục
    - suc-khoe: Sức khỏe
    - doi-song: Đời sống
    """
    rss_url = f'https://vnexpress.net/rss/{category}.rss'
    
    try:
        response = requests.get(rss_url)
        response.raise_for_status()  # Kiểm tra lỗi HTTP
        
        # Parse XML
        root = ET.fromstring(response.content)
        
        # Lấy các item (bài báo)
        items = root.findall('.//item')
        
        news_list = []
        for item in items:
            title = item.find('title').text
            description = item.find('description').text
            link = item.find('link').text
            pub_date = item.find('pubDate').text
            
            # Xử lý phần mô tả, loại bỏ hoàn toàn các thẻ HTML và CDATA
            if description:
                # Loại bỏ CDATA wrapper nếu có
                description = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', description)
                
                # Loại bỏ tất cả các thẻ HTML
                description = re.sub(r'<.*?>', '', description)
                
                # Giải mã các ký tự đặc biệt HTML
                description = html.unescape(description)
                
                # Loại bỏ khoảng trắng thừa
                description = re.sub(r'\s+', ' ', description).strip()
            else:
                description = "Không có mô tả"
            
            news_list.append({
                'title': title,
                'description': description,
                'link': link,
                'pub_date': pub_date
            })
        
        return news_list
    
    except Exception as e:
        print(f"Lỗi khi lấy tin từ VnExpress: {str(e)}")
        return []

def search_news_by_keyword(keyword, categories=None, limit=5):
    """
    Tìm kiếm tin tức theo từ khóa từ nhiều chuyên mục
    
    Args:
        keyword: Từ khóa tìm kiếm (ví dụ: "Hà Nội")
        categories: Danh sách các chuyên mục cần tìm, mặc định sẽ tìm trong các chuyên mục chính
        limit: Giới hạn số lượng bài viết trả về, mặc định là 5
    
    Returns:
        Danh sách các bài báo có chứa từ khóa trong tiêu đề hoặc mô tả
    """
    if categories is None:
        categories = ['thoi-su', 'the-gioi', 'kinh-doanh', 'giai-tri', 'the-thao', 'phap-luat', 'giao-duc', 'suc-khoe', 'doi-song']
    
    all_news = []
    matched_news = []
    
    # Lấy tin từ tất cả các chuyên mục
    for category in categories:
        news_list = get_vnexpress_news(category)
        all_news.extend(news_list)
    
    # Tìm kiếm theo từ khóa (không phân biệt hoa thường)
    keyword_pattern = re.compile(keyword, re.IGNORECASE)
    
    for article in all_news:
        if (keyword_pattern.search(article['title']) or
            keyword_pattern.search(article['description'])):
            matched_news.append({
                'title': article['title'],
                'description': article['description']
            })
            # Nếu đã đủ số lượng bài viết cần lấy thì dừng lại
            if len(matched_news) >= limit:
                break
    
    return matched_news[:limit]  # Đảm bảo không vượt quá giới hạn

if __name__ == "__main__":
    # Tìm kiếm tin tức với từ khóa "Hà Nội"
    keyword = "Hà Nội"
    limit = 5  # Giới hạn chỉ lấy 5 bài viết
    news = search_news_by_keyword(keyword, limit=limit)
    
    print(f"Tìm thấy {len(news)} tin tức về '{keyword}' từ VnExpress (giới hạn {limit} bài):\n")
    
    for i, article in enumerate(news, start=1):
        print(f"Tin {i}:")
        print(f"Tiêu đề: {article['title']}")
        print(f"Mô tả: {article['description']}")
        print('---')
    
    # Ví dụ tìm kiếm chỉ trong một số chuyên mục cụ thể và giới hạn số lượng
    # news = search_news_by_keyword("Hà Nội", ["thoi-su", "kinh-doanh"], limit=3)
    
    # Lấy tin tức từ chuyên mục Thời sự
    news = get_vnexpress_news('thoi-su')
    
    print(f"Tìm thấy {len(news)} tin tức từ VnExpress:\n")
    
    for i, article in enumerate(news, start=1):
        print(f"Tin {i}:")
        print(f"Tiêu đề: {article['title']}")
        print(f"Mô tả: {article['description']}")
        print(f"Link: {article['link']}")
        print(f"Thời gian: {article['pub_date']}")
        print('---')
    
    # Bạn có thể thử với các chuyên mục khác
    # news = get_vnexpress_news('the-gioi')
    # news = get_vnexpress_news('kinh-doanh') 