import React from 'react';
import { SearchIcon, QRIcon, EditIcon } from './Icons';

const TableList = ({ tables, onGenerateQR, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bàn số</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khu vực</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sức chứa</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tables.map((table) => (
              <tr key={table.id} className="hover:bg-gray-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{table.table_number}</div>
                  {table.description && <div className="text-xs text-gray-400 mt-0.5 max-w-[150px] truncate">{table.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium border border-gray-200">
                     {table.location}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {table.capacity} người
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                    table.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 self-center ${
                      table.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}></span>
                    {table.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onGenerateQR(table)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      title="Xem mã QR"
                    >
                      <QRIcon />
                    </button>
                    <button 
                      onClick={() => onEdit(table)}
                      className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
                      title="Chỉnh sửa"
                    >
                      <EditIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tables.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <SearchIcon />
                    <span className="mt-2 text-sm">Không tìm thấy bàn nào phù hợp.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableList;