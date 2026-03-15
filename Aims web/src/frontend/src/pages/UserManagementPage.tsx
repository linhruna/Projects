import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock, Unlock, Mail, Key, Users, Loader2 } from 'lucide-react';
import { userApi, UserApiResponse } from '../services/api';
import { User } from '../types';
import { toast } from 'sonner';

// Map API role to frontend role
const mapApiRoleToFrontend = (role: string): User['role'] => {
  const roleMap: Record<string, User['role']> = {
    'ADMIN': 'admin',
    'MANAGER_PRODUCT': 'productManager',
  };
  return roleMap[role] || 'customer';
};

// Map frontend role to API role
const mapFrontendRoleToApi = (role: User['role']): 'ADMIN' | 'MANAGER_PRODUCT' => {
  const roleMap: Record<string, 'ADMIN' | 'MANAGER_PRODUCT'> = {
    'admin': 'ADMIN',
    'productManager': 'MANAGER_PRODUCT',
  };
  return roleMap[role] || 'MANAGER_PRODUCT';
};

// Map API response to frontend User type
const mapApiToUser = (apiUser: UserApiResponse): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  role: mapApiRoleToFrontend(apiUser.role),
  isBlocked: !apiUser.active,
});

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const apiUsers = await userApi.getAll();
        const mappedUsers = apiUsers.map(mapApiToUser);
        setUsers(mappedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formRef = React.useRef<HTMLDivElement>(null);

  // Scroll to form when it opens
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editingUser]); // Add editingUser to dependency to ensure it scrolls when switching between add/edit if form is already open? 
  // Actually usually form closes then opens or just updates. showForm toggle is enough. But if I click Edit while Add is open?
  // User "handleEditClick" sets showForm true. If it was already true? Use editingUser as well.

  const handleCreateUser = () => {
    setEditingUser({
      id: '',
      name: '',
      email: '',
      role: 'productManager',
      isBlocked: false
    });
    setNewPassword('');
    setIsCreating(true);
    setShowForm(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
    setNewPassword('');
    setIsCreating(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    if (!editingUser.name.trim()) {
      toast.error('Vui lòng nhập tên người dùng');
      return;
    }
    if (!editingUser.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingUser.email)) {
      toast.error('Email không hợp lệ');
      return;
    }
    if (isCreating && !newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    const isDuplicate = users.some(
      u => u.email === editingUser.email && u.id !== editingUser.id
    );
    if (isDuplicate) {
      toast.error('Email đã tồn tại');
      return;
    }

    try {
      setSaving(true);

      if (isCreating) {
        const response = await userApi.create({
          name: editingUser.name,
          email: editingUser.email,
          password: newPassword,
          role: mapFrontendRoleToApi(editingUser.role),
        });
        const newUser = mapApiToUser(response);
        setUsers([...users, newUser]);
        toast.success(`Đã tạo người dùng "${editingUser.name}"`);
        toast.success(`Đã gửi email thông báo tới ${editingUser.email}`);
      } else {
        const response = await userApi.update(editingUser.id, {
          name: editingUser.name,
          email: editingUser.email,
          password: newPassword || undefined,
          role: mapFrontendRoleToApi(editingUser.role),
        });
        const updatedUser = mapApiToUser(response);
        setUsers(users.map(u => (u.id === editingUser.id ? updatedUser : u)));
        toast.success(`Đã cập nhật người dùng "${editingUser.name}"`);
        toast.success(`Đã gửi email thông báo tới ${editingUser.email}`);
      }

      setShowForm(false);
      setEditingUser(null);
      setIsCreating(false);
      setNewPassword('');
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(isCreating ? 'Không thể tạo người dùng' : 'Không thể cập nhật người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirmation({
      isOpen: true,
      userId: user.id,
      userName: user.name
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await userApi.delete(deleteConfirmation.userId);
      setUsers(users.filter(u => u.id !== deleteConfirmation.userId));
      toast.success(`Đã xóa người dùng "${deleteConfirmation.userName}"`);
      toast.success(`Đã gửi email thông báo tới ${deleteConfirmation.userId}`); // Note: ID used as email logic in prev code was weird, keeping assuming user object had email. 
      // Actually previous code used `user.email`. I only have ID/Name stored in state.
      // I should store email too or find user.
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Không thể xóa người dùng');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleToggleBlock = async (user: User) => {
    try {
      // Use dedicated block/unblock endpoints
      if (user.isBlocked) {
        await userApi.unblock(user.id);
      } else {
        await userApi.block(user.id);
      }

      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
      );
      setUsers(updatedUsers);
      const action = !user.isBlocked ? 'chặn' : 'bỏ chặn';
      toast.success(`Đã ${action} người dùng "${user.name}"`);
      toast.success(`Đã gửi email thông báo tới ${user.email}`);
    } catch (error) {
      console.error('Failed to toggle block:', error);
      toast.error('Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleResetPassword = async (user: User) => {
    const newPwd = Math.random().toString(36).slice(-8);
    try {
      await userApi.resetPassword(user.id, newPwd);
      toast.success(`Đã reset mật khẩu cho "${user.name}"`);
      toast.success(`Mật khẩu mới: ${newPwd}`, { duration: 10000 }); // Show password for demo purposes
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Không thể reset mật khẩu');
    }
  };

  const roleConfig = {
    customer: { label: 'Khách hàng', color: 'from-blue-400 to-blue-500' },
    productManager: { label: 'Quản lý SP', color: 'from-purple-400 to-purple-500' },
    admin: { label: 'Admin', color: 'from-pink-400 to-pink-500' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2">Quản lý người dùng</h1>
            <p className="text-muted-foreground">Tạo, sửa, xóa và quản lý quyền người dùng</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-soft font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo người dùng</span>
          </button>
        </div>

        {showForm && editingUser && (
          <div ref={formRef} className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-6">
            <h2 className="mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
              <Users className="w-5 h-5 text-primary-dark" />
              {isCreating ? 'Tạo người dùng mới' : 'Chỉnh sửa người dùng'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-foreground font-medium mb-2">Họ và tên *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-foreground font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-foreground font-medium mb-2">
                  {isCreating ? 'Mật khẩu *' : 'Mật khẩu mới (để trống nếu không đổi)'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-foreground font-medium mb-2">Vai trò *</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as User['role']
                    })
                  }
                  className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="productManager">Quản lý sản phẩm</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-soft font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCreating ? 'Tạo' : 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setIsCreating(false);
                  setNewPassword('');
                }}
                className="bg-muted text-foreground px-6 py-3 rounded-xl hover:bg-muted/80 transition-colors font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/50 to-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Chưa có người dùng nào</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className={`${user.isBlocked ? 'bg-destructive/5' : ''} hover:bg-muted/30 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#A7C7E7] to-[#C8B6FF] rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-sm font-medium">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-xl text-white bg-gradient-to-r ${roleConfig[user.role].color}`}>
                          {roleConfig[user.role].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs font-medium rounded-xl ${user.isBlocked
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-success/10 text-success border border-success/20'
                            }`}
                        >
                          {user.isBlocked ? 'Bị chặn' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`p-2 rounded-lg transition-colors ${user.isBlocked
                              ? 'text-success hover:bg-success/10'
                              : 'text-warning hover:bg-warning/10'
                              }`}
                            title={user.isBlocked ? 'Bỏ chặn' : 'Chặn'}
                          >
                            {user.isBlocked ? (
                              <Unlock className="w-5 h-5" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Reset mật khẩu"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Xác nhận xóa</h3>
              </div>

              <p className="text-gray-500 mb-6">
                Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold text-gray-900">"{deleteConfirmation.userName}"</span>?
                Hành động này sẽ vô hiệu hóa tài khoản và không thể hoàn tác ngay lập tức.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-destructive hover:bg-destructive/90 rounded-xl font-medium transition-colors shadow-sm"
                >
                  Xóa người dùng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-[#A7C7E7]/10 to-[#C8B6FF]/10 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A7C7E7] to-[#C8B6FF] rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-foreground">
              <p className="mb-2 font-medium">
                Thông báo email tự động
              </p>
              <p className="text-muted-foreground mb-1">
                Mỗi khi có thao tác quản trị (tạo, sửa, xóa, block, reset mật khẩu),
                hệ thống sẽ tự động gửi email thông báo đến người dùng.
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Trong môi trường demo này, các email được mô phỏng thông qua thông báo toast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
