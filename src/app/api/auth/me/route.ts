import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/backend/repositories/UserRepository';
import { ROLE_PERMISSIONS, UserRole } from '@/backend/domain/user';

export async function GET() {
  const user = userRepository.getActiveUser();
  const permissions = ROLE_PERMISSIONS[user.role];
  const allUsers = userRepository.getAllUsers();

  return NextResponse.json({
    success: true,
    user,
    permissions,
    allUsers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, role, name, email } = body;

    // 1. Chuyển đổi User active nhanh (Switch User)
    if (action === 'switch_user') {
      const switched = userRepository.switchActiveUser(userId);
      if (!switched) {
        return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: switched,
        permissions: ROLE_PERMISSIONS[switched.role],
        message: `Đã chuyển sang tài khoản: ${switched.name} (${switched.role.toUpperCase()})`,
      });
    }

    // 2. Đổi role của user hiện tại
    if (action === 'switch_role') {
      const active = userRepository.getActiveUser();
      userRepository.updateRole(active.id, role as UserRole);
      const updated = userRepository.getActiveUser();
      return NextResponse.json({
        success: true,
        user: updated,
        permissions: ROLE_PERMISSIONS[updated.role],
        message: `Đã cập nhật vai trò sang: ${updated.role.toUpperCase()}`,
      });
    }

    // 3. Đăng ký tài khoản mới
    if (action === 'register') {
      const newUser = userRepository.createUser(name || 'Thành Viên Mới', email || `user${Date.now()}@gmail.com`);
      userRepository.switchActiveUser(newUser.id);
      return NextResponse.json({
        success: true,
        user: newUser,
        permissions: ROLE_PERMISSIONS[newUser.role],
        message: 'Đăng ký thành công! Bạn nhận được 100.000 đ vào ví.',
      });
    }

    return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
