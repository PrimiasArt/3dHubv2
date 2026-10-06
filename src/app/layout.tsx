import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/common/Navbar';

export const metadata: Metadata = {
  title: '3D HUB - Spatial 3D Studio & Maker Intelligence',
  description: 'Nền tảng 3D Hub đỉnh cao: Dựng hình 3D từ ảnh bằng AI Vision, dịch vụ in FDM & SLA xưởng Bambu Lab chuyên nghiệp, phân tích xu hướng thiết kế toàn cầu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full bg-[#111713] text-white antialiased">
      <body className="min-h-full flex flex-col bg-[#111713] bg-[radial-gradient(ellipse_100%_80%_at_50%_-15%,rgba(55,80,60,0.45),rgba(20,28,22,0.85)_60%,rgba(13,18,14,1)_100%)] text-white relative selection:bg-white/20 selection:text-white">
        {/* Subtle Ambient Spatial Glow Behind Everything */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[500px] rounded-full bg-[#46694E]/15 blur-[120px]" />
          <div className="absolute top-[40%] right-[10%] w-[500px] h-[400px] rounded-full bg-[#36523C]/10 blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/10 bg-[#162018]/60 backdrop-blur-xl py-10 text-xs text-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white/90">3D HUB Spatial Studio</span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="hidden sm:inline text-white/60">Hệ Sinh Thái In 3D &amp; Trí Tuệ Nhân Tạo Thế Hệ Mới</span>
              </div>
              <div className="flex items-center gap-6 text-white/50">
                <span className="hover:text-white/80 transition-colors">Bảo mật</span>
                <span className="hover:text-white/80 transition-colors">Điều khoản</span>
                <span>© 2026 3D HUB Inc. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
