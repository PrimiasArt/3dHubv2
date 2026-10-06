import { IUser, UserRole, INITIAL_USERS } from '../domain/user';
import { IPaymentTransaction } from '../domain/payment';

class UserRepository {
  private users: IUser[] = [...INITIAL_USERS];
  private activeUserId: string = 'usr-admin-1'; // Mặc định là Admin để người dùng trải nghiệm toàn quyền
  private transactions: IPaymentTransaction[] = [
    {
      id: 'tx-init-1',
      userId: 'usr-customer-1',
      amountVnd: 250000,
      method: 'vietqr',
      type: 'deposit',
      status: 'completed',
      description: 'Nạp tiền ví qua VietQR Napas 24/7',
      createdAt: '2026-03-10T10:30:00.000Z',
      updatedAt: '2026-03-10T10:30:30.000Z',
    },
    {
      id: 'tx-init-2',
      userId: 'usr-admin-1',
      amountVnd: 5000000,
      method: 'wallet',
      type: 'deposit',
      status: 'completed',
      description: 'Khởi tạo số dư hệ thống quản trị',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  getAllUsers(): IUser[] {
    return this.users;
  }

  getUserById(id: string): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  getActiveUser(): IUser {
    const user = this.getUserById(this.activeUserId);
    if (!user) {
      this.activeUserId = this.users[0]?.id || 'usr-admin-1';
      return this.users[0];
    }
    return user;
  }

  switchActiveUser(id: string): IUser | undefined {
    const user = this.getUserById(id);
    if (user) {
      this.activeUserId = id;
      return user;
    }
    return undefined;
  }

  updateBalance(id: string, deltaVnd: number): number {
    const user = this.getUserById(id);
    if (!user) return 0;
    user.walletBalanceVnd = Math.max(0, user.walletBalanceVnd + deltaVnd);
    return user.walletBalanceVnd;
  }

  updateRole(id: string, newRole: UserRole): boolean {
    const user = this.getUserById(id);
    if (!user) return false;
    user.role = newRole;
    return true;
  }

  createUser(name: string, email: string, role: UserRole = 'user'): IUser {
    const newUser: IUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      walletBalanceVnd: 100000, // Tặng 100.000đ khi đăng ký mới
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    this.users.push(newUser);
    return newUser;
  }

  addTransaction(tx: Omit<IPaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>): IPaymentTransaction {
    const newTx: IPaymentTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.transactions.unshift(newTx);
    return newTx;
  }

  getTransactionsByUser(userId: string): IPaymentTransaction[] {
    return this.transactions.filter((t) => t.userId === userId);
  }

  getAllTransactions(): IPaymentTransaction[] {
    return this.transactions;
  }
}

export const userRepository = new UserRepository();
