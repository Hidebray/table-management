import React from 'react';
import { saveAs } from 'file-saver';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/admin` 
  : 'http://localhost:5000/api/admin';

const QRModal = ({ qrData, tableNumber, tableId, createdDate, onClose }) => {
  if (!qrData) return null;

  const handleDownload = () => {
    window.location.href = `${baseURL}/tables/${tableId}/qr/download`;
  };

  const formattedDate = createdDate 
    ? new Date(createdDate).toLocaleString('vi-VN', { 
        hour: '2-digit', minute: '2-digit', 
        day: '2-digit', month: '2-digit', year: 'numeric' 
      }) 
    : 'Vừa mới tạo';

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>In QR Bàn ${tableNumber}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; text-align: center; padding: 20px; }
            .print-container { 
              border: 2px solid #333; 
              padding: 40px; 
              max-width: 400px; 
              margin: 0 auto; 
              border-radius: 15px;
            }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
            .table-num { font-size: 36px; font-weight: 800; margin: 20px 0; color: #222; }
            img { width: 250px; height: 250px; margin-bottom: 20px; }
            .guide { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .wifi { font-size: 14px; color: #666; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="logo">🍽️ Smart Restaurant</div>
            <div class="table-num">BÀN ${tableNumber}</div>
            <img src="${qrData}" />
            <div class="guide">SCAN TO ORDER</div>
            <div class="wifi">
              📶 WiFi: SmartRest_Guest<br/>
              🔑 Pass: 88888888
            </div>
            <p style="font-size: 10px; color: #999; margin-top: 20px;">
               Ngày tạo: ${formattedDate}
            </p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all scale-100">
        <h2 className="text-2xl font-bold text-gray-800">QR Code Bàn {tableNumber}</h2>
        
        {/* 3. Hiển thị ngày tạo trên giao diện Modal */}
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Được tạo lúc: <span className="font-medium text-gray-700">{formattedDate}</span>
        </p>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 mb-6 flex justify-center">
          <img src={qrData} alt="QR Code" className="w-48 h-48 object-contain" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button 
              onClick={handleDownload} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition shadow-md"
            >
              📥 Tải PNG
            </button>
            <button 
              onClick={handlePrint} 
              className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition shadow-sm"
            >
              🖨️ In PDF
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="w-full text-red-500 hover:bg-red-50 py-2 px-4 rounded-lg font-medium transition mt-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;