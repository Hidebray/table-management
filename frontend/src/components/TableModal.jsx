// frontend/src/components/TableModal.jsx
import React, { useState, useEffect } from 'react';

const TableModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: '',
    location: 'Indoor',
    description: '',
    status: 'active' // Mặc định
  });

  // Khi mở modal lên: Nếu có initialData (Sửa) thì điền vào, không thì reset (Tạo mới)
  useEffect(() => {
    if (initialData) {
      setFormData({
        table_number: initialData.table_number,
        capacity: initialData.capacity,
        location: initialData.location,
        description: initialData.description || '',
        status: initialData.status
      });
    } else {
      setFormData({
        table_number: '',
        capacity: '',
        location: '',
        description: '',
        status: 'active'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData && initialData.status === 'active' && formData.status === 'inactive') {
      const confirm = window.confirm("⚠️ Cảnh báo: Bạn đang tắt bàn này.\nNếu bàn đang có khách, họ sẽ không thể gọi món.\n\nBạn có chắc chắn muốn tiếp tục?");
      if (!confirm) return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? '✏️ Chỉnh Sửa Bàn' : '➕ Thêm Bàn Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Row 1: Số bàn & Sức chứa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số bàn / Tên bàn</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="VD: T-01"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
              <input
                type="number"
                required
                min="1"
                max="20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                placeholder="1 - 20"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Khu vực & Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>

              <input 
                list="locations"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Chọn hoặc nhập khu vực mới..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />

              <datalist id="locations">
                <option value="Indoor" />
                <option value="Outdoor" />
                <option value="Patio" />
                <option value="VIP Room" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>

          {/* Row 3: Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm (Tùy chọn)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              rows="3"
              placeholder="Ghi chú về vị trí hoặc đặc điểm bàn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md transition transform active:scale-95"
            >
              {initialData ? 'Lưu Thay Đổi' : 'Tạo Bàn Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;