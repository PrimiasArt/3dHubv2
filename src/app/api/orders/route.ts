import { NextRequest, NextResponse } from 'next/server';
import { orderRepository } from '@/backend/repositories/OrderRepository';
import { userRepository } from '@/backend/repositories/UserRepository';
import { OrderFulfillmentStatus } from '@/backend/domain/order';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const myOrdersOnly = searchParams.get('myOrders') === 'true';

    const activeUser = userRepository.getActiveUser();

    if (id) {
      const order = orderRepository.getOrderById(id);
      if (!order) {
        return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    // Nếu người dùng thông thường hoặc truyền myOrders=true thì chỉ lấy đơn của user đó
    const isStaffOrAdmin = activeUser.role === 'admin' || activeUser.role === 'staff' || activeUser.role === 'mod';
    
    let orders = orderRepository.getAllOrders();
    if (myOrdersOnly || !isStaffOrAdmin) {
      orders = orderRepository.getOrdersByUser(activeUser.id);
    }

    const printers = orderRepository.getPrinters();
    const stats = orderRepository.getWorkshopStats();

    return NextResponse.json({
      success: true,
      orders,
      printers,
      stats,
      currentUserRole: activeUser.role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi lấy thông tin đơn hàng' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, status, printerName, printerId, progressPercent } = body;
    const activeUser = userRepository.getActiveUser();

    // Quyền cập nhật: admin, staff, mod
    const canManageOrders = activeUser.role === 'admin' || activeUser.role === 'staff' || activeUser.role === 'mod';
    if (!canManageOrders) {
      return NextResponse.json(
        { error: 'Bạn không có quyền quản lý đơn hàng. Vui lòng chuyển sang tài khoản Admin hoặc Staff!' },
        { status: 403 }
      );
    }

    // 1. Cập nhật tiến độ xưởng in (Fulfillment status)
    if (action === 'update_status') {
      if (!orderId || !status) {
        return NextResponse.json({ error: 'Thiếu orderId hoặc status' }, { status: 400 });
      }

      const updated = orderRepository.updateFulfillmentStatus(
        orderId,
        status as OrderFulfillmentStatus,
        printerName
      );

      if (!updated) {
        return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: updated,
        message: `Đã cập nhật đơn #${orderId} sang trạng thái: ${status}`,
        stats: orderRepository.getWorkshopStats(),
        printers: orderRepository.getPrinters(),
      });
    }

    // 2. Phân bổ máy in (Assign printer)
    if (action === 'assign_printer') {
      if (!orderId || !printerName) {
        return NextResponse.json({ error: 'Thiếu orderId hoặc printerName' }, { status: 400 });
      }

      const updated = orderRepository.assignPrinter(orderId, printerName);
      if (!updated) {
        return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: updated,
        message: `Đã phân bổ đơn #${orderId} tới máy in: ${printerName}`,
        stats: orderRepository.getWorkshopStats(),
        printers: orderRepository.getPrinters(),
      });
    }

    // 3. Cập nhật % tiến độ máy in
    if (action === 'update_printer_progress') {
      if (!printerId || progressPercent === undefined) {
        return NextResponse.json({ error: 'Thiếu printerId hoặc progressPercent' }, { status: 400 });
      }

      const ok = orderRepository.updatePrinterProgress(printerId, Number(progressPercent));
      return NextResponse.json({
        success: ok,
        printers: orderRepository.getPrinters(),
      });
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi máy chủ' }, { status: 500 });
  }
}
