// frontend/src/TableManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableList from '../components/TableList';
import QRModal from '../components/QRModal';
import TableModal from '../components/TableModal';
import { PlusIcon, SearchIcon, DownloadIcon, PrinterIcon, RefreshIcon, ShieldAlertIcon } from '../components/Icons';

const TableManager = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);

  // States Modal
  const [qrData, setQrData] = useState(null);
  const [selectedTableForQR, setSelectedTableForQR] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // States Filter & Sort
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('number');

  useEffect(() => { fetchTables(); }, [filterStatus, filterLocation, sortBy]);
  useEffect(() => { fetchLocations(); }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ sortBy });
      if (filterStatus) params.append('status', filterStatus);
      if (filterLocation) params.append('location', filterLocation);

      // Sửa lại URL API chuẩn
      const res = await axios.get(`http://localhost:5000/api/admin/tables?${params.toString()}`);
      setTables(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/tables/locations');
      setAvailableLocations(res.data);
    } catch (err) { console.error(err); }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTable) {
        await axios.put(`http://localhost:5000/api/admin/tables/${editingTable.id}`, formData);
        alert("Đã cập nhật!");
      } else {
        await axios.post('http://localhost:5000/api/admin/tables', formData);
        alert("Đã tạo mới!");
      }
      setIsFormOpen(false);
      fetchTables();
      fetchLocations(); // Cập nhật lại list location nếu có cái mới
    } catch (err) { alert(err.response?.data?.error || "Lỗi xử lý"); }
  };

  const handleGenerateQR = async (table) => {
    try {
      setSelectedTableForQR(table);
      const res = await axios.post(`http://localhost:5000/api/admin/tables/${table.id}/qr/generate`);
      setQrData(res.data.qrCodeImage);
    } catch (err) { alert("Lỗi tạo QR"); }
  };

  const handleDownloadAll = () => window.location.href = 'http://localhost:5000/api/admin/tables/qr/download-all';
  const handleDownloadPDF = () => window.location.href = 'http://localhost:5000/api/admin/tables/qr/download-pdf';

  const handleRegenerateAll = async () => {
    if (!window.confirm("⚠️ CẢNH BÁO: Tất cả mã QR cũ sẽ bị vô hiệu hóa. Tiếp tục?")) return;
    try {
      await axios.post('http://localhost:5000/api/admin/tables/qr/regenerate-all');
      alert("Đã làm mới thành công!");
      fetchTables();
    } catch (err) { alert("Lỗi hệ thống"); }
  };

  // Tính toán thống kê nhanh
  const stats = {
    total: tables.length,
    active: tables.filter(t => t.status === 'active').length,
    inactive: tables.filter(t => t.status === 'inactive').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Bàn Ăn</h1>
            <p className="text-gray-500 text-sm mt-1">Hệ thống quản trị mã QR & Trạng thái bàn</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              <span className="text-gray-500 block text-xs uppercase font-bold">Tổng số bàn</span>
              <span className="text-xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-lg shadow-sm border border-emerald-100">
              <span className="text-emerald-600 block text-xs uppercase font-bold">Hoạt động</span>
              <span className="text-xl font-bold text-emerald-700">{stats.active}</span>
            </div>
          </div>
        </div>

        {/* TOOLBAR (FILTER & ACTIONS) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 justify-between items-center">

          {/* Left: Filters */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition w-full md:w-48 appearance-none"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="">📍 Tất cả khu vực</option>
                {availableLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
              </select>
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">⚡ Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="number">🔤 Tên bàn (A-Z)</option>
              <option value="capacity">👥 Sức chứa</option>
              <option value="newest">🕒 Mới nhất</option>
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
            {/* Group Download */}
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              <button onClick={handleDownloadAll} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 flex items-center gap-2">
                <DownloadIcon /> ZIP
              </button>
              <button onClick={handleDownloadPDF} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300 rounded-r-lg hover:bg-gray-50 flex items-center gap-2">
                <PrinterIcon /> PDF
              </button>
            </div>

            {/* Danger Zone */}
            <button
              onClick={handleRegenerateAll}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition flex items-center gap-2"
              title="Vô hiệu hóa tất cả mã cũ & Tạo mã mới"
            >
              <ShieldAlertIcon />
              <span className="hidden md:inline">Reset QR</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => { fetchTables(); fetchLocations(); }}
              className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-emerald-600 transition"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* MAIN TABLE */}
        {loading ? (
          <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
            <RefreshIcon /> <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <TableList
            tables={tables}
            onGenerateQR={handleGenerateQR}
            onEdit={(table) => { setEditingTable(table); setIsFormOpen(true); }}
          />
        )}

        {/* Primary Action */}
        <div className="flex justify-end mt-4">
        <button 
          onClick={() => { setEditingTable(null); setIsFormOpen(true); }}
          className="px-6 py-3 text-base font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
        >
          <PlusIcon /> Thêm Bàn Mới
        </button>
      </div>

      </div>

      <QRModal
        qrData={qrData}
        tableId={selectedTableForQR?.id}
        tableNumber={selectedTableForQR?.table_number}
        createdDate={selectedTableForQR?.qr_token_created_at}
        onClose={() => setQrData(null)}
      />

      <TableModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTable}
      />
    </div>
  );
};

export default TableManager;