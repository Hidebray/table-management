import React from 'react';
import TableManager from './pages/TableManager';
import Menu from './pages/Menu';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định hoặc /admin thì vào trang Quản lý */}
        <Route path="/" element={<TableManager />} />
        <Route path="/admin" element={<TableManager />} />
        
        {/* Đường dẫn /menu dành cho khách quét QR */}
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;