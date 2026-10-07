import { NextRequest, NextResponse } from 'next/server';
import { shopService } from '@/backend/services/shop/ShopService';
import { userWalletService } from '@/backend/services/wallet/UserWalletService';
import { orderRepository } from '@/backend/repositories/OrderRepository';
import { userRepository } from '@/backend/repositories/UserRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || undefined;
    const material = searchParams.get('material') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const subCategory = searchParams.get('subCategory') || undefined;
    const slicer = searchParams.get('slicer') || undefined;
    const isFreeParam = searchParams.get('isFree');
    const isFree = isFreeParam !== null ? isFreeParam === 'true' : undefined;

    // Lấy thống kê KPI tồn kho cho Admin & Mod
    if (action === 'inventory_stats') {
      const stats = shopService.getInventoryStats();
      return NextResponse.json({ success: true, stats });
    }

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
    const inventoryStats = shopService.getInventoryStats();

    return NextResponse.json({
      filaments,
      accessories,
      services,
      profiles,
      models,
      inventoryStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server khi lấy dữ liệu shop' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. THANH TOÁN ĐƠN HÀNG (Dành cho khách hàng & người dùng)
    if (action === 'checkout') {
      const { items, totalAmountVnd, customerInfo, paymentMethod } = body;
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
          return NextResponse.json(
            {
              error: `Số dư ví không đủ (${userWalletService.getBalance().toLocaleString('vi-VN')} đ). Vui lòng nạp thêm tiền!`,
              balanceVnd: userWalletService.getBalance(),
              needTopUp: true,
            },
            { status: 402 }
          );
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

    // ==========================================
    // CÁC HÀNH ĐỘNG QUẢN LÝ KHO DÀNH CHO ADMIN & MOD
    // ==========================================
    const activeUser = userRepository.getActiveUser();
    const isAuthorized = activeUser && (activeUser.role === 'admin' || activeUser.role === 'mod');

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Chỉ Quản trị viên (Admin) và Quản lý (Mod) mới có quyền quản lý kho hàng và sản phẩm' },
        { status: 403 }
      );
    }

    // 2. TẠO SẢN PHẨM MỚI (Filament hoặc Accessory)
    if (action === 'create_product') {
      const { productType, productData } = body;
      if (!productType || !productData) {
        return NextResponse.json({ error: 'Thiếu thông tin sản phẩm cần tạo' }, { status: 400 });
      }

      let createdItem;
      if (productType === 'filament') {
        createdItem = shopService.addFilament(productData);
      } else if (productType === 'accessory') {
        createdItem = shopService.addAccessory(productData);
      } else {
        return NextResponse.json({ error: 'Loại sản phẩm không hợp lệ (phải là filament hoặc accessory)' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Đã thêm sản phẩm "${createdItem.name}" vào kho!`,
        item: createdItem,
        stats: shopService.getInventoryStats(),
      });
    }

    // 3. CẬP NHẬT THÔNG TIN SẢN PHẨM
    if (action === 'update_product') {
      const { id, productType, productData } = body;
      if (!id || !productType || !productData) {
        return NextResponse.json({ error: 'Thiếu thông tin cập nhật sản phẩm' }, { status: 400 });
      }

      let updatedItem = null;
      if (productType === 'filament') {
        updatedItem = shopService.updateFilament(id, productData);
      } else if (productType === 'accessory') {
        updatedItem = shopService.updateAccessory(id, productData);
      }

      if (!updatedItem) {
        return NextResponse.json({ error: 'Không tìm thấy sản phẩm cần cập nhật' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật sản phẩm "${updatedItem.name}"!`,
        item: updatedItem,
        stats: shopService.getInventoryStats(),
      });
    }

    // 4. XÓA SẢN PHẨM KHỎI KHO
    if (action === 'delete_product') {
      const { id, productType } = body;
      if (!id || !productType) {
        return NextResponse.json({ error: 'Thiếu ID hoặc loại sản phẩm cần xóa' }, { status: 400 });
      }

      let deleted = false;
      if (productType === 'filament') {
        deleted = shopService.deleteFilament(id);
      } else if (productType === 'accessory') {
        deleted = shopService.deleteAccessory(id);
      }

      if (!deleted) {
        return NextResponse.json({ error: 'Không thể xóa hoặc không tìm thấy sản phẩm' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi kho hàng thành công!',
        stats: shopService.getInventoryStats(),
      });
    }

    // 5. ĐIỀU CHỈNH SỐ LƯỢNG TỒN KHO NHANH (+1, -1, +5, set exact, toggle inStock)
    if (action === 'update_stock') {
      const { id, productType, delta, exact, inStock } = body;
      if (!id || !productType) {
        return NextResponse.json({ error: 'Thiếu thông tin sản phẩm cần cập nhật kho' }, { status: 400 });
      }

      const result = shopService.updateStock(id, productType, { delta, exact, inStock });
      if (!result.success) {
        return NextResponse.json({ error: result.message || 'Không thể cập nhật tồn kho' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật tồn kho cho "${result.item?.name}" (Tồn hiện tại: ${result.item?.stockCount})`,
        item: result.item,
        stats: shopService.getInventoryStats(),
      });
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi xử lý yêu cầu shop' }, { status: 500 });
  }
}
