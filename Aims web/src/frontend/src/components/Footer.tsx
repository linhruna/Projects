import React from 'react';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 gradient-blend rounded-xl flex items-center justify-center shadow-soft">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                AIMS
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AIMS - An Internet Media Store là cửa hàng trực tuyến chuyên cung cấp các sản phẩm 
              media chất lượng cao bao gồm sách, báo, CD và DVD.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Liên hệ</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-1">Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>024 3869 4242</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>contact@aims.vn</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Giờ làm việc</h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-muted/50">
                <span className="text-sm text-muted-foreground">Thứ 2 - Thứ 6</span>
                <span className="text-sm font-medium text-foreground">8:00 - 20:00</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 rounded-xl bg-muted/50">
                <span className="text-sm text-muted-foreground">Thứ 7 - CN</span>
                <span className="text-sm font-medium text-foreground">9:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-10 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 AIMS Store. All rights reserved. Made with <span className="text-destructive">❤️</span> by AIMS Team
          </p>
        </div>
      </div>
    </footer>
  );
};