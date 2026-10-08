import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/common/Navbar';
import { StagingSandboxDock } from '@/components/common/StagingSandboxDock';

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
    <html lang="vi" data-env="staging" className="h-full bg-[var(--background)] text-[var(--vision-text-primary)] antialiased transition-colors duration-500">
      <body className="min-h-full flex flex-col bg-[var(--background)] [background-image:var(--page-radial)] text-[var(--vision-text-primary)] relative selection:bg-white/20 selection:text-white transition-colors duration-500">
        {/* Subtle Ambient Spatial Glow Behind Everything */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[20%] w-[680px] h-[540px] rounded-full bg-[var(--glow-1)] blur-[130px] transition-colors duration-500" />
          <div className="absolute top-[38%] right-[8%] w-[580px] h-[460px] rounded-full bg-[var(--glow-2)] blur-[150px] transition-colors duration-500" />
          <div className="absolute bottom-[-8%] left-[32%] w-[520px] h-[420px] rounded-full bg-[var(--glow-warm)] blur-[140px] transition-colors duration-500" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-[var(--vision-border)] bg-[var(--vision-glass-panel)] backdrop-blur-xl py-10 text-xs text-[var(--vision-text-muted)] transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[var(--vision-text-primary)]">3D HUB Spatial Studio</span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="hidden sm:inline text-[var(--vision-text-secondary)]">Hệ Sinh Thái In 3D &amp; Trí Tuệ Nhân Tạo Thế Hệ Mới</span>
              </div>
              <div className="flex items-center gap-6 text-[var(--vision-text-muted)]">
                <span className="hover:text-[var(--vision-text-primary)] transition-colors">Bảo mật</span>
                <span className="hover:text-[var(--vision-text-primary)] transition-colors">Điều khoản</span>
                <span>© 2026 3D HUB Inc. All rights reserved.</span>
              </div>
            </div>
          </footer>
          <StagingSandboxDock />
        </div>
      </body>
    </html>
  );
}
