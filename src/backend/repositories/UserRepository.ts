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

  getUserByEmail(email: string): IUser | undefined {
    return this.users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  }

  loginOrCreateGoogleUser(payload: {
    email: string;
    name: string;
    avatar?: string;
    googleId?: string;
  }): { user: IUser; isNew: boolean } {
    const existing = this.getUserByEmail(payload.email);
    if (existing) {
      if (payload.avatar && (!existing.avatar || existing.avatar.includes('unsplash'))) {
        existing.avatar = payload.avatar;
      }
      if (payload.name && existing.name === 'Khách hàng') {
        existing.name = payload.name;
      }
      if (payload.googleId) {
        existing.googleId = payload.googleId;
      }
      this.activeUserId = existing.id;
      return { user: existing, isNew: false };
    }

    const newUser: IUser = {
      id: `usr-google-${Date.now()}`,
      name: payload.name || 'Người dùng Google',
      email: payload.email,
      role: 'user',
      avatar:
        payload.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          payload.name || payload.email
        )}`,
      walletBalanceVnd: 50000, // 50.000 đ chào mừng đăng nhập Google
      createdAt: new Date().toISOString(),
      status: 'active',
      googleId: payload.googleId || `g_${Date.now()}`,
    };
    this.users.push(newUser);
    this.activeUserId = newUser.id;

    // Ghi nhận giao dịch tặng thưởng vào ví
    this.addTransaction({
      userId: newUser.id,
      amountVnd: 50000,
      method: 'wallet',
      type: 'deposit',
      status: 'completed',
      description: '🎁 Thưởng 50.000 đ chào mừng đăng nhập thành viên Google',
    });

    return { user: newUser, isNew: true };
  }

  createUser(name: string, email: string, role: UserRole = 'user', avatar?: string): IUser {
    const existing = this.getUserByEmail(email);
    if (existing) {
      this.activeUserId = existing.id;
      return existing;
    }
    const newUser: IUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatar:
        avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
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
