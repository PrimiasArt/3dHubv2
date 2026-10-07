'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Wallet,
  Truck,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  PackageCheck,
} from 'lucide-react';
import { ICartItem } from '@/backend/domain/shop';
import { useUserWallet } from '@/hooks/useUserWallet';
import { useSystemEnvironment } from '@/hooks/useSystemEnvironment';
import {
  generateVietQRUrl,
  generateMoMoQRUrl,
  OFFICIAL_BANK_INFO,
  OFFICIAL_MOMO_INFO,
} from '@/backend/domain/payment';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ICartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  totalVnd: number;
  onCheckout: (
    paymentMethod: 'wallet' | 'vietqr' | 'momo' | 'cod' | 'bank_transfer',
    customerInfo: { name: string; phone: string; address: string; notes?: string }
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  isProcessing: boolean;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  totalVnd,
  onCheckout,
  isProcessing,
}: CartDrawerProps) {
  const { balanceVnd, setIsTopUpModalOpen } = useUserWallet();
  const { isOfficial, isStaging, commercial } = useSystemEnvironment();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'vietqr' | 'momo' | 'cod'>('wallet');

  // Customer Form
  const [name, setName] = useState('Nguyễn Văn Khách');
  const [phone, setPhone] = useState('0909887766');
  const [address, setAddress] = useState('Số 45 Đường Lê Duẩn, Quận 1, TP. HCM');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success State
  const [completedOrder, setCompletedOrder] = useState<{ orderId: string; totalVnd: number } | null>(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const isWalletInsufficient = paymentMethod === 'wallet' && balanceVnd < totalVnd;

  // Transfer code memo for QR (Official uses formal invoice code, Staging uses Sandbox memo)
  const orderTransferCode = isOfficial
    ? `3DHUB HD${Math.floor(100000 + Math.random() * 900000)}`
    : `STAGING TEST ${Math.floor(100000 + Math.random() * 900000)}`;
  const vietQrUrl = generateVietQRUrl(totalVnd, orderTransferCode);
  const momoQrUrl = generateMoMoQRUrl(totalVnd, orderTransferCode);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (paymentMethod !== 'wallet' && (!name || !phone || !address)) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng.');
      return;
    }

    if (isWalletInsufficient) {
      setErrorMsg('Số dư ví 3D Hub không đủ. Vui lòng nạp thêm tiền hoặc chọn hình thức quét QR VietQR/MoMo!');
      return;
    }

    const res = await onCheckout(paymentMethod, { name, phone, address, notes });
    if (res.success && res.orderId) {
      setCompletedOrder({ orderId: res.orderId, totalVnd });
    } else if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleCloseAndReset = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleCloseAndReset}
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md vision-glass-panel border-l border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.6)] flex flex-col justify-between text-white">
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <ShoppingCart className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Giỏ Hàng Của Bạn</h2>
                <p className="text-xs text-white/60">{items.length} món hàng được chọn</p>
              </div>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* If Order Completed */}
          {completedOrder ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/20 animate-bounce">
                <PackageCheck className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Đặt Hàng Thành Công!</h3>
                <p className="text-xs text-emerald-300 font-bold mt-1">
                  Mã đơn hàng: #{completedOrder.orderId}
                </p>
                <p className="text-xs text-white/70 mt-2 max-w-xs leading-relaxed">
                  {isOfficial
                    ? `Đơn hàng thương mại đã được tiếp nhận bởi ${commercial?.companyName || '3D Hub'}. Hệ thống tự động xuất phiếu bảo hành 1 đổi 1 và giao hàng trong 24h.`
                    : 'Đơn hàng thử nghiệm Sandbox đã được ghi nhận trong môi trường Staging. Bạn không bị trừ tiền thực tế.'}
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-white/10 border border-white/15 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Hình thức:</span>
                  <span className="font-bold text-white uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tổng thanh toán:</span>
                  <span className="font-bold text-emerald-300 text-sm">
                    {completedOrder.totalVnd.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Người nhận:</span>
                  <span className="font-semibold text-white">{name} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Địa chỉ:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">{address}</span>
                </div>
              </div>

              <div className="w-full space-y-2 pt-2">
                <a
                  href="/admin"
                  className="w-full block py-3 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/20 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Xem Điều Phối Xưởng In (Admin)
                </a>
                <button
                  onClick={handleCloseAndReset}
                  className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-medium text-xs transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          ) : (
            /* Items List Scrollable */
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/50">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Giỏ hàng đang trống</h3>
                  <p className="text-xs text-white/60 max-w-xs">
                    Khám phá cuộn nhựa chính hãng, linh kiện hoặc đặt in dịch vụ 3D để thêm vào giỏ.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold shadow-sm transition-all border border-white/15"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-white/60 pb-2 border-b border-white/10">
                    <span>Sản phẩm</span>
                    <button
                      onClick={onClearCart}
                      className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 hover:border-white/25 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden relative shadow-sm">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={36}
                            height={36}
                            unoptimized={item.imageUrl?.endsWith?.('.svg')}
                            className="object-contain max-w-full max-h-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          {item.subText && (
                            <p className="text-[11px] text-white/60 truncate">{item.subText}</p>
                          )}
                          <div className="text-xs font-bold text-emerald-300 mt-1">
                            {(item.priceVnd * item.quantity).toLocaleString('vi-VN')} đ
                          </div>
                        </div>

                        {/* Quantity & Delete */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-white/50 hover:text-rose-400 transition-colors"
                            title="Xóa món này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1.5 bg-black/30 rounded-xl p-0.5 border border-white/15">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1 text-white/70 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-1.5">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1 text-white/70 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Options Form */}
                  <form onSubmit={handleSubmitCheckout} className="space-y-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white block">
                        Chọn Cổng Thanh Toán
                      </label>

                      {/* 1. Wallet */}
                      <div
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === 'wallet'
                            ? 'bg-white/25 border-white/40 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold">Số Dư Ví 3D Hub</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-300">
                            {balanceVnd.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        {isWalletInsufficient && (
                          <div className="mt-1 text-[11px] text-rose-300 flex items-center justify-between">
                            <span>Số dư không đủ</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsTopUpModalOpen(true);
                              }}
                              className="underline text-emerald-300 font-bold"
                            >
                              + Nạp ngay VietQR/MoMo
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 2. VietQR Napas 24/7 */}
                      <div
                        onClick={() => setPaymentMethod('vietqr')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === 'vietqr'
                            ? 'bg-white/25 border-white/40 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold">VietQR Napas 24/7 (MB Bank)</span>
                          </div>
                          <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                            Tự động 30s
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-1">
                          Quét mã QR qua mọi ứng dụng ngân hàng (Vietcombank, MB, Techcombank, BIDV...)
                        </p>
                      </div>

                      {/* 3. MoMo QR */}
                      <div
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === 'momo'
                            ? 'bg-white/25 border-white/40 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-pink-400" />
                            <span className="text-xs font-bold">Ví Điện Tử MoMo</span>
                          </div>
                          <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                            Khuyên dùng
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-1">
                          Mở ứng dụng MoMo quét mã QR thanh toán tức thì
                        </p>
                      </div>

                      {/* 4. COD */}
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === 'cod'
                            ? 'bg-white/25 border-white/40 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold">Thanh Toán Khi Nhận Hàng (COD)</span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          Kiểm tra sản phẩm trước khi thanh toán tiền mặt cho shipper
                        </p>
                      </div>
                    </div>

                    {/* QR Preview Box for VietQR / MoMo */}
                    {(paymentMethod === 'vietqr' || paymentMethod === 'momo') && (
                      <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center space-y-3">
                        <p className="text-xs font-bold text-white">
                          Mã QR Thanh Toán Đơn Hàng ({totalVnd.toLocaleString('vi-VN')} đ)
                        </p>

                        <div className="relative w-44 h-44 mx-auto bg-white p-2 rounded-2xl shadow-md border border-white/20">
                          <Image
                            src={paymentMethod === 'vietqr' ? vietQrUrl : momoQrUrl}
                            alt="Payment QR"
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>

                        <div className="text-[11px] text-left space-y-1 bg-black/30 p-3 rounded-xl border border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Tài khoản nhận:</span>
                            <span className="font-bold text-white">
                              {paymentMethod === 'vietqr'
                                ? `${OFFICIAL_BANK_INFO.accountNumber} (${OFFICIAL_BANK_INFO.bankId})`
                                : `${OFFICIAL_MOMO_INFO.phoneNumber} (MoMo)`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Nội dung CK:</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(orderTransferCode, 'content')}
                              className="font-mono font-bold text-emerald-300 hover:underline flex items-center gap-1"
                            >
                              <span>{orderTransferCode}</span>
                              {copiedKey === 'content' ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-white/50" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customer Delivery Information */}
                    <div className="space-y-2.5 pt-2">
                      <label className="text-xs font-bold text-white block">
                        Thông Tin Nhận Hàng
                      </label>
                      <input
                        type="text"
                        placeholder="Họ và tên người nhận *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại liên hệ *"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ giao hàng chi tiết *"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Ghi chú in / đóng gói (tùy chọn)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          )}

          {/* Bottom Footer Checkout Summary */}
          {!completedOrder && items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Tạm tính ({items.length} món):</span>
                <span className="font-semibold text-white">
                  {totalVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-300">Miễn phí toàn quốc</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-sm font-bold text-white">Tổng thanh toán:</span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  {totalVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitCheckout}
                disabled={isProcessing || isWalletInsufficient}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-xs shadow-md active:scale-98 transition-all ${
                  isProcessing || isWalletInsufficient
                    ? 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
                    : 'bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                }`}
              >
                <span>
                  {isProcessing
                    ? 'Đang Xử Lý Đơn Hàng...'
                    : paymentMethod === 'vietqr' || paymentMethod === 'momo'
                    ? 'Xác Nhận & Hoàn Tất Đặt Hàng'
                    : 'Tiến Hành Đặt Hàng Ngay'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
