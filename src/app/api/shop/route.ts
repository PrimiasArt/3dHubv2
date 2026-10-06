import { NextRequest, NextResponse } from 'next/server';
import { shopService } from '@/backend/services/shop/ShopService';
import { userWalletService } from '@/backend/services/wallet/UserWalletService';
import { orderRepository } from '@/backend/repositories/OrderRepository';
import { userRepository } from '@/backend/repositories/UserRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || undefined;
    const material = searchParams.get('material') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const subCategory = searchParams.get('subCategory') || undefined;
    const slicer = searchParams.get('slicer') || undefined;
    const isFreeParam = searchParams.get('isFree');
    const isFree = isFreeParam !== null ? isFreeParam === 'true' : undefined;

    // Lấy chi tiết 1 sản phẩm
    if (id) {
      const item = shopService.getItemById(id);
      if (!item) {
        return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
      }
      return NextResponse.json({ item });
    }

    // Trả về theo từng tab danh mục
    if (category === 'filaments_accessories') {
      const filaments = shopService.getFilaments({ material, brand, search });
      const accessories = shopService.getAccessories({ subCategory, brand, search });
      return NextResponse.json({ filaments, accessories });
    }

    if (category === 'printing_services') {
      const services = shopService.getPrintingServices();
      const profiles = shopService.getPrintProfiles({ slicer, isFree, search });
      return NextResponse.json({ services, profiles });
    }

    if (category === 'models_marketplace') {
      const models = shopService.getShopModels({ isFree, category: subCategory, search });
      return NextResponse.json({ models });
    }

    // Mặc định trả về toàn bộ dữ liệu tổng hợp
    const filaments = shopService.getFilaments({ search });
    const accessories = shopService.getAccessories({ search });
    const services = shopService.getPrintingServices();
    const profiles = shopService.getPrintProfiles({ search });
    const models = shopService.getShopModels({ search });

    return NextResponse.json({
      filaments,
      accessories,
      services,
      profiles,
      models,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server khi lấy dữ liệu shop' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, items, totalAmountVnd, customerInfo, paymentMethod } = body;

    if (action === 'checkout') {
      if (!items || !items.length) {
        return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
      }

      const activeUser = userRepository.getActiveUser();

      // Nếu thanh toán bằng ví số dư
      if (paymentMethod === 'wallet') {
        const deductResult = userWalletService.deduct(
          totalAmountVnd,
          `Thanh toán đơn hàng Cửa hàng 3D Hub (${items.length} món)`
        );

        if (!deductResult.success) {
          return NextResponse.json({
            error: `Số dư ví không đủ (${userWalletService.getBalance().toLocaleString('vi-VN')} đ). Vui lòng nạp thêm tiền!`,
            balanceVnd: userWalletService.getBalance(),
            needTopUp: true,
          }, { status: 402 });
        }
      }

      // Tạo đơn hàng thực tế vào OrderRepository
      const order = orderRepository.createOrder({
        userId: activeUser.id,
        customerName: customerInfo?.name || activeUser.name,
        customerPhone: customerInfo?.phone || activeUser.phone || '0901234567',
        customerAddress: customerInfo?.address || activeUser.address || 'Hồ Chí Minh, Việt Nam',
        customerEmail: activeUser.email,
        notes: customerInfo?.notes,
        items,
        totalAmountVnd,
        paymentMethod: paymentMethod || 'wallet',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        order,
        message: 'Đặt hàng thành công!',
        totalAmountVnd,
        newBalanceVnd: userWalletService.getBalance(),
        paymentMethod,
        itemsCount: items.length,
        createdAt: order.createdAt,
      });
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xử lý đơn hàng' }, { status: 500 });
  }
}
