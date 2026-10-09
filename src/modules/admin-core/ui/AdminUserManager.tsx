'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  ShieldAlert,
  Store,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Minus,
  Edit2,
  Trash2,
  X,
  Eye,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Coins,
} from 'lucide-react';
import { IUser, UserRole } from '@/backend/domain/user';

interface AdminUserManagerProps {
  users: IUser[];
  currentUserId?: string;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function AdminUserManager({
  users,
  currentUserId,
  onRefresh,
  showToast,
}: AdminUserManagerProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'balance_desc' | 'name_asc'>('newest');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserBalance, setNewUserBalance] = useState<number>(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adjust balance form state
  const [balanceDelta, setBalanceDelta] = useState<number>(100000);
  const [balanceMode, setBalanceMode] = useState<'add' | 'deduct'>('add');
  const [balanceNote, setBalanceNote] = useState('');

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const adminMod = users.filter((u) => u.role === 'admin' || u.role === 'mod').length;
    const sellers = users.filter((u) => u.role === 'seller').length;
    const customers = users.filter((u) => u.role === 'user').length;
    const totalBalance = users.reduce((sum, u) => sum + (u.walletBalanceVnd || 0), 0);
    const activeCount = users.filter((u) => u.status !== 'suspended').length;
    return { total, adminMod, sellers, customers, totalBalance, activeCount };
  }, [users]);

  // Filtered & Sorted users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.phone && u.phone.includes(searchQuery));

        const matchesRole = selectedRole === 'all' || u.role === selectedRole;
        const matchesStatus =
          selectedStatus === 'all' ||
          (selectedStatus === 'active' && u.status !== 'suspended') ||
          (selectedStatus === 'suspended' && u.status === 'suspended');

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'balance_desc') {
          return (b.walletBalanceVnd || 0) - (a.walletBalanceVnd || 0);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        // newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [users, searchQuery, selectedRole, selectedStatus, sortBy]);

  // Handle Switch User Role
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch_role', userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã đổi vai trò sang: ${newRole.toUpperCase()}`);
        onRefresh();
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể đổi vai trò'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi mạng: ${err.message}`);
    }
  };

  // Handle Toggle Status (Active / Suspended)
  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Đã cập nhật trạng thái người dùng');
        onRefresh();
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể thay đổi trạng thái'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    }
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên và email!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          role: newUserRole,
          amount: newUserBalance,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã tạo thành công tài khoản: ${newUserName}`);
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        setNewUserRole('user');
        setNewUserBalance(50000);
        onRefresh();
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể tạo tài khoản'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Adjust Balance
  const handleConfirmAdjustBalance = async () => {
    if (!selectedUser) return;
    const finalDelta = balanceMode === 'add' ? balanceDelta : -balanceDelta;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_balance',
          userId: selectedUser.id,
          amount: finalDelta,
          description: balanceNote || `Quản trị viên ${balanceMode === 'add' ? 'nạp tiền' : 'trừ tiền'} ví`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã ${balanceMode === 'add' ? 'cộng' : 'trừ'} ${balanceDelta.toLocaleString('vi-VN')} đ cho ${selectedUser.name}`);
        setIsAdjustBalanceOpen(false);
        setBalanceNote('');
        onRefresh();
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể điều chỉnh số dư'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    }
  };

  // Handle Quick Add Balance
  const handleQuickAdd = async (userId: string, amount: number) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_balance',
          userId,
          amount,
          description: `Nạp nhanh +${amount.toLocaleString('vi-VN')} đ từ Quản Trị Viên`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã cộng nhanh +${amount.toLocaleString('vi-VN')} đ`);
        onRefresh();
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string, name: string) => {
    if (userId === currentUserId || userId === 'usr-admin-1') {
      showToast('Không thể xóa tài khoản Quản trị viên chính!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã xóa tài khoản ${name}`);
        onRefresh();
      } else {
        showToast(`Lỗi: ${data.error || 'Không thể xóa tài khoản'}`);
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'ADMIN',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'mod':
        return {
          label: 'MOD',
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'seller':
        return {
          label: 'SELLER',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'staff':
        return {
          label: 'STAFF',
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      default:
        return {
          label: 'USER',
          bg: 'bg-white/10 text-white/80 border-white/20',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="vision-glass rounded-[32px] p-6 shadow-2xl backdrop-blur-2xl border border-white/15">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 flex items-center justify-center text-[#5EEAD4]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Quản Lý Người Dùng &amp; Phân Quyền (RBAC)</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2DD4BF]/20 text-[#5EEAD4] border border-[#2DD4BF]/30">
                    {users.length} thành viên
                  </span>
                </h2>
                <p className="text-xs text-white/60">
                  Toàn quyền quản trị tài khoản, phân định vai trò, điều chỉnh ví và kiểm soát trạng thái hoạt động
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all active:scale-95"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-5 py-2 rounded-full bg-[#2DD4BF] hover:bg-[#20b8a5] text-[#051817] text-xs font-bold shadow-[0_0_20px_rgba(45,212,191,0.35)] flex items-center gap-2 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Thành Viên Mới</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>Tổng Thành Viên</span>
              <Users className="w-4 h-4 text-[#5EEAD4]" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats.total}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              ● {stats.activeCount} đang hoạt động
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>Quản Trị &amp; Kiểm Duyệt</span>
              <Shield className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-300">
              {stats.adminMod}
            </div>
            <div className="text-[10px] text-white/50">
              Admin &amp; Moderator
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>Đối Tác Bán Hàng</span>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {stats.sellers}
            </div>
            <div className="text-[10px] text-white/50">
              Seller phân phối mô hình &amp; sản phẩm
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span>Tổng Tiền Ví Hệ Thống</span>
              <Wallet className="w-4 h-4 text-[#5EEAD4]" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#5EEAD4] font-mono">
              {stats.totalBalance.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-[10px] text-white/50">
              Số dư ví người dùng khả dụng
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="vision-glass rounded-[28px] p-4 sm:p-5 backdrop-blur-2xl border border-white/15 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo họ tên, email, SĐT hoặc ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/30 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#2DD4BF]/50"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {/* Role Filter */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/30 border border-white/10 shrink-0">
              {[
                { id: 'all', label: 'Tất cả vai trò' },
                { id: 'admin', label: 'Admin' },
                { id: 'mod', label: 'Mod' },
                { id: 'seller', label: 'Seller' },
                { id: 'staff', label: 'Staff' },
                { id: 'user', label: 'User' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedRole === r.id
                      ? 'bg-[#2DD4BF] text-[#051817] shadow-xs'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-black/30 border border-white/15 text-xs text-white/80 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="all" className="bg-[#0A2724]">Tất cả trạng thái</option>
              <option value="active" className="bg-[#0A2724]">Đang hoạt động</option>
              <option value="suspended" className="bg-[#0A2724]">Đã tạm khóa</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-full bg-black/30 border border-white/15 text-xs text-white/80 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="newest" className="bg-[#0A2724]">Mới nhất</option>
              <option value="balance_desc" className="bg-[#0A2724]">Số dư ví: Cao &rarr; Thấp</option>
              <option value="name_asc" className="bg-[#0A2724]">Họ tên: A &rarr; Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="vision-glass rounded-[32px] p-5 sm:p-6 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3 px-3">Thành Viên</th>
                <th className="pb-3 px-3">Email &amp; SĐT</th>
                <th className="pb-3 px-3">Vai Trò Hệ Thống</th>
                <th className="pb-3 px-3">Trạng Thái</th>
                <th className="pb-3 px-3">Số Dư Ví</th>
                <th className="pb-3 px-3 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/50 text-xs">
                    Không tìm thấy thành viên nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isMainAdmin = u.id === 'usr-admin-1';
                  const badge = getRoleBadge(u.role);
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      {/* Column 1: Member */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-black/40 border border-white/20 shrink-0">
                            {u.avatar ? (
                              <Image
                                src={u.avatar}
                                alt={u.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-white/80">
                                {u.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-[#2DD4BF]/20 text-[#5EEAD4] px-2 py-0.5 rounded-full font-black border border-[#2DD4BF]/40">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/40 font-mono">{u.id}</span>
                              {u.googleId && (
                                <span className="text-[9px] text-[#5EEAD4] font-medium flex items-center gap-0.5">
                                  <span>G</span> Google
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact */}
                      <td className="py-3.5 px-3">
                        <div className="text-white font-medium">{u.email}</div>
                        <div className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-white/40" />
                          <span>{u.phone || 'Chưa cập nhật'}</span>
                        </div>
                      </td>

                      {/* Column 3: Role Switcher */}
                      <td className="py-3.5 px-3">
                        <select
                          value={u.role}
                          disabled={isMainAdmin && isSelf}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all focus:outline-none ${badge.bg}`}
                        >
                          <option value="admin" className="bg-[#0A2724] text-rose-300">ADMIN (Toàn quyền)</option>
                          <option value="mod" className="bg-[#0A2724] text-indigo-300">MOD (Kiểm duyệt)</option>
                          <option value="seller" className="bg-[#0A2724] text-amber-300">SELLER (Người bán đối tác)</option>
                          <option value="staff" className="bg-[#0A2724] text-cyan-300">STAFF (Kỹ thuật xưởng)</option>
                          <option value="user" className="bg-[#0A2724] text-white">USER (Khách hàng)</option>
                        </select>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          disabled={isMainAdmin}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            isSuspended
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                          title={isSuspended ? 'Bấm để mở khóa' : 'Bấm để tạm khóa tài khoản'}
                        >
                          {isSuspended ? (
                            <>
                              <Lock className="w-3 h-3 text-rose-400" />
                              <span>Đã tạm khóa</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Hoạt động</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Column 5: Wallet Balance & Quick Topup */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-[#5EEAD4] text-sm font-mono">
                          {(u.walletBalanceVnd || 0).toLocaleString('vi-VN')} đ
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={() => handleQuickAdd(u.id, 50000)}
                            className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[9px] font-bold text-white transition-all"
                            title="Nạp nhanh 50k"
                          >
                            +50k
                          </button>
                          <button
                            onClick={() => handleQuickAdd(u.id, 200000)}
                            className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[9px] font-bold text-white transition-all"
                            title="Nạp nhanh 200k"
                          >
                            +200k
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsAdjustBalanceOpen(true);
                            }}
                            className="px-2 py-0.5 rounded-md bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 border border-[#2DD4BF]/40 text-[9px] font-bold text-[#5EEAD4] transition-all"
                            title="Điều chỉnh số dư ví chi tiết"
                          >
                            Tùy chỉnh
                          </button>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsAdjustBalanceOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 text-[#5EEAD4] border border-[#2DD4BF]/30 transition-all"
                            title="Nạp hoặc trừ tiền ví"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>

                          {!isMainAdmin && !isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 transition-all"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md vision-glass-panel rounded-[32px] border border-white/20 p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#5EEAD4]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Tạo Thành Viên Mới</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Địa chỉ Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nguyenvana@gmail.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Vai trò (RBAC)
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                  >
                    <option value="user" className="bg-[#0A2724]">Khách hàng (User)</option>
                    <option value="seller" className="bg-[#0A2724]">Người bán (Seller)</option>
                    <option value="staff" className="bg-[#0A2724]">Xưởng in (Staff)</option>
                    <option value="mod" className="bg-[#0A2724]">Kiểm duyệt (Mod)</option>
                    <option value="admin" className="bg-[#0A2724]">Quản trị (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Số dư khởi tạo
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={newUserBalance}
                    onChange={(e) => setNewUserBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a5] text-xs font-bold text-[#051817] shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Xác Nhận Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust Balance */}
      {isAdjustBalanceOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md vision-glass-panel rounded-[32px] border border-white/20 p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 flex items-center justify-center text-[#5EEAD4]">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Điều Chỉnh Số Dư Ví</h3>
                  <p className="text-[11px] text-white/60">Tài khoản: {selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustBalanceOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/70">Số dư hiện tại:</span>
                <span className="text-base font-black text-[#5EEAD4] font-mono">
                  {(selectedUser.walletBalanceVnd || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              {/* Mode Switcher: Add or Deduct */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setBalanceMode('add')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    balanceMode === 'add'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-xs'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cộng Tiền (Nạp)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceMode('deduct')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    balanceMode === 'deduct'
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40 shadow-xs'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Trừ Tiền (Rút)</span>
                </button>
              </div>

              {/* Amount Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Mức tiền thay đổi (VND):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBalanceDelta(amt)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        balanceDelta === amt
                          ? 'bg-[#2DD4BF] text-[#051817] border-[#2DD4BF]'
                          : 'bg-white/10 hover:bg-white/15 text-white/80 border-white/10'
                      }`}
                    >
                      {(amt / 1000).toLocaleString()}k
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="10000"
                  value={balanceDelta}
                  onChange={(e) => setBalanceDelta(Math.max(0, Number(e.target.value)))}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              {/* Note / Reason */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Lý do / Ghi chú kiểm toán:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thưởng thành viên xuất sắc, bồi thường đơn in..."
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdjustBalanceOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdjustBalance}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    balanceMode === 'add'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  Xác Nhận {balanceMode === 'add' ? 'Cộng' : 'Trừ'} Tiền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: User Detail */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg vision-glass-panel rounded-[32px] border border-white/20 p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#5EEAD4]" />
                <h3 className="text-sm font-bold text-white">Hồ Sơ Thành Viên Chi Tiết</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/30 border border-white/10">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-black/50 border border-white/20 shrink-0">
                  {selectedUser.avatar ? (
                    <Image src={selectedUser.avatar} alt={selectedUser.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-white">
                      {selectedUser.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-white truncate">{selectedUser.name}</h4>
                  <p className="text-xs text-white/60 truncate">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-white/50">{selectedUser.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(selectedUser.role).bg}`}>
                      {getRoleBadge(selectedUser.role).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/60 text-[11px]">Số dư ví khả dụng:</span>
                  <div className="text-base font-black text-[#5EEAD4] font-mono">
                    {(selectedUser.walletBalanceVnd || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/60 text-[11px]">Trạng thái tài khoản:</span>
                  <div className="font-bold flex items-center gap-1.5 mt-0.5">
                    {selectedUser.status === 'suspended' ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Đã tạm khóa
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đang hoạt động
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/60 text-[11px]">Số điện thoại:</span>
                  <div className="font-medium text-white">{selectedUser.phone || 'Chưa cập nhật'}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/60 text-[11px]">Ngày tham gia:</span>
                  <div className="font-medium text-white">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsAdjustBalanceOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 border border-[#2DD4BF]/40 text-[#5EEAD4] text-xs font-bold transition-all text-center"
                >
                  Nạp / Trừ Tiền Ví
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
