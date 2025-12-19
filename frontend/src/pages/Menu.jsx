import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const rawURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin';
const baseURL = rawURL.replace(/\/admin$/, '/');

const Menu = () => {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // loading, valid, invalid
    const [tableInfo, setTableInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (tableId && token) {
            verifyToken();
        } else {
            setStatus('invalid');
            setErrorMessage('Đường dẫn không hợp lệ.');
        }
    }, [tableId, token]);

    const verifyToken = async () => {
        try {
            // Gọi API 
            const res = await axios.get(`${baseURL}/menu?tableId=${tableId}&token=${token}`);

            if (res.data.valid) {
                setTableInfo(res.data.table);
                setStatus('valid');
            }
        } catch (err) {
            setStatus('invalid');
            // Hiển thị thông báo thân thiện (User-friendly message)
            setErrorMessage(err.response?.data?.message || 'Mã QR không hợp lệ hoặc đã hết hạn.');
        }
    };

    if (status === 'loading') {
        return <div className="p-10 text-center text-gray-500">⏳ Đang xác thực mã QR...</div>;
    }

    if (status === 'invalid') {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm">
                    <div className="text-5xl mb-4">🚫</div>
                    <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi Truy Cập</h2>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    <div className="text-sm text-gray-400 border-t pt-4">
                        Vui lòng liên hệ nhân viên để được hỗ trợ cấp lại mã mới.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-emerald-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">Thực Đơn</h1>
                    <p className="opacity-90 mt-1">Bàn số: {tableInfo.number}</p>
                </div>

                {/* Content Demo */}
                <div className="p-6 text-center">
                    <p className="text-gray-600 mb-4">Chào mừng bạn đến với nhà hàng!</p>
                    <button className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-700 transition">
                        🖋️ Bắt đầu gọi món
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menu;