import os
import win32com.client
import time
 
# Mở ứng dụng PowerPoint
ppt = win32com.client.Dispatch("PowerPoint.Application")
ppt.Visible = True  # Đảm bảo PowerPoint có thể nhìn thấy
 
# Đường dẫn tệp PowerPoint (Đảm bảo rằng bạn đã mở tệp này trước đó)
pptx_filename = 'test.pptx'
 
# Kiểm tra xem tệp có tồn tại không
if not os.path.exists(pptx_filename):
    print(f"Tệp {pptx_filename} không tồn tại!")
else:
    # Mở tệp PowerPoint đang có sẵn
    presentation = ppt.Presentations.Open(os.path.abspath(pptx_filename))
 
    print("🤖 Chương trình đang chạy. Nhập nội dung mới cho slide hoặc 'exit' để thoát:")
 
    while True:
        # Nhập nội dung mới từ người dùng
        user_input = input("Nhập nội dung cho slide mới (hoặc 'exit' để thoát): ").strip()
 
        # Nếu người dùng nhập 'exit', thoát vòng lặp
        if user_input.lower() == "exit":
            print("👋 Thoát chương trình.")
            break
 
        # Thêm slide mới vào cuối của slide show hiện tại
        slide_layout = presentation.Designs(1).SlideMaster.CustomLayouts(1)  # Chọn layout cho slide mới
        slide = presentation.Slides.Add(presentation.Slides.Count + 1, 1)  # Thêm slide mới ở cuối
        title = slide.Shapes(1).TextFrame.TextRange
        title.Text = user_input  # Đặt nội dung slide
 
        # Lưu lại tệp sau khi thêm slide
        presentation.Save()
        print(f"📝 Đã thêm slide với nội dung: '{user_input}'")
 
        # Thêm khoảng thời gian ngắn để không quá nhanh
        time.sleep(1)
 
    # Đóng tệp PowerPoint khi thoát
    presentation.Close()