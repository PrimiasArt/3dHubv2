import {
  IOrder,
  IOrderItem,
  IPrinterDevice,
  INITIAL_ORDERS,
  WORKSHOP_PRINTERS,
  OrderFulfillmentStatus,
  OrderPaymentMethod,
  OrderPaymentStatus,
} from '../domain/order';

class OrderRepository {
  private orders: IOrder[] = [...INITIAL_ORDERS];
  private printers: IPrinterDevice[] = [...WORKSHOP_PRINTERS];

  getAllOrders(): IOrder[] {
    return this.orders;
  }

  getOrderById(id: string): IOrder | undefined {
    return this.orders.find((o) => o.id === id);
  }

  getOrdersByUser(userId: string): IOrder[] {
    return this.orders.filter((o) => o.userId === userId);
  }

  createOrder(data: {
    userId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerEmail?: string;
    notes?: string;
    items: IOrderItem[];
    totalAmountVnd: number;
    paymentMethod: OrderPaymentMethod;
    paymentStatus?: OrderPaymentStatus;
    aiTier?: 'tripo_fast' | 'trellis_pro' | 'meshy_ultra' | 'none';
  }): IOrder {
    const newOrder: IOrder = {
      id: `DH3D-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: data.userId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      customerEmail: data.customerEmail,
      notes: data.notes,
      items: data.items,
      totalAmountVnd: data.totalAmountVnd,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || (data.paymentMethod === 'cod' ? 'pending' : 'paid'),
      fulfillmentStatus: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateFulfillmentStatus(
    id: string,
    status: OrderFulfillmentStatus,
    printer?: string
  ): IOrder | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;

    order.fulfillmentStatus = status;
    if (printer !== undefined) {
      order.assignedPrinter = printer;
    }
    order.updatedAt = new Date().toISOString();

    // Tự động đồng bộ trạng thái máy in tương ứng
    if (order.assignedPrinter) {
      const prt = this.printers.find((p) => p.name === order.assignedPrinter);
      if (prt) {
        if (status === 'printing') {
          prt.status = 'printing';
          prt.currentOrderId = order.id;
          prt.currentProgressPercent = prt.currentProgressPercent || 15;
        } else if (status === 'completed' || status === 'cancelled') {
          prt.status = 'idle';
          prt.currentOrderId = undefined;
          prt.currentProgressPercent = undefined;
        }
      }
    }

    return order;
  }

  assignPrinter(id: string, printerName: string): IOrder | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;

    order.assignedPrinter = printerName;
    order.fulfillmentStatus = 'printing';
    order.updatedAt = new Date().toISOString();

    const prt = this.printers.find((p) => p.name === printerName);
    if (prt) {
      prt.status = 'printing';
      prt.currentOrderId = order.id;
      prt.currentProgressPercent = 10;
    }

    return order;
  }

  getPrinters(): IPrinterDevice[] {
    return this.printers;
  }

  updatePrinterProgress(printerId: string, progressPercent: number): boolean {
    const prt = this.printers.find((p) => p.id === printerId);
    if (!prt) return false;
    prt.currentProgressPercent = progressPercent;
    return true;
  }

  getWorkshopStats() {
    const totalOrders = this.orders.length;
    const completedOrders = this.orders.filter((o) => o.fulfillmentStatus === 'completed').length;
    const activePrintingJobs = this.orders.filter((o) => o.fulfillmentStatus === 'printing').length;
    const pendingReviewCount = this.orders.filter((o) => o.fulfillmentStatus === 'pending_review' || o.fulfillmentStatus === 'slicing').length;
    const totalRevenueVnd = this.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmountVnd, 0);

    const activePrintersCount = this.printers.filter((p) => p.status === 'printing').length;
    const totalPrintersCount = this.printers.length;

    return {
      totalOrders,
      completedOrders,
      activePrintingJobs,
      pendingReviewCount,
      totalRevenueVnd,
      activePrintersCount,
      totalPrintersCount,
    };
  }
}

export const orderRepository = new OrderRepository();
