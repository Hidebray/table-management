// backend/controllers/tableController.js
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const archiver = require('archiver');
const path = require('path'); 
const PDFDocument = require('pdfkit');

// 1. Get all tables (Hỗ trợ Filter & Sort)
exports.getAllTables = async (req, res) => {
  try {
    const { status, location, sortBy } = req.query;

    let query = 'SELECT * FROM tables WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (location) {
      query += ` AND location = $${paramIndex}`;
      params.push(location);
      paramIndex++;
    }

    // Map các tiêu chí sort an toàn để tránh SQL Injection
    const validSorts = {
      'capacity': 'capacity ASC',
      'capacity_desc': 'capacity DESC',
      'number': 'table_number ASC',
      'number_desc': 'table_number DESC',
      'newest': 'created_at DESC',
      'oldest': 'created_at ASC'
    };

    // Mặc định sort theo table_number
    const orderBy = validSorts[sortBy] || 'table_number ASC';
    query += ` ORDER BY ${orderBy}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Lỗi Server khi lấy danh sách bàn.' });
  }
};

// 2. Get Single Table
exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bàn.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Lỗi Server.' });
  }
};

// 3. Create Table (Đã bỏ validation vì dùng Middleware)
exports.createTable = async (req, res) => {
  try {
    const { table_number, capacity, location, description } = req.body;

    const result = await pool.query(
      'INSERT INTO tables (table_number, capacity, location, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [table_number, capacity, location || 'Indoor', description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Số bàn này đã tồn tại.' });
    console.error(err.message);
    res.status(500).json({ error: 'Lỗi Server.' });
  }
};

// 4. Update Table
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, capacity, location, description, status } = req.body;
    const result = await pool.query(
      'UPDATE tables SET table_number = $1, capacity = $2, location = $3, description = $4, status = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [table_number, capacity, location, description, status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bàn.' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Số bàn mới bị trùng lặp.' });
    res.status(500).json({ error: 'Lỗi Server.' });
  }
};

// 5. Toggle Status (Logic nâng cao)
exports.toggleTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // --- LOGIC GIẢ LẬP CHECK ACTIVE ORDERS ---
    // Nếu bạn có bảng orders, hãy uncomment đoạn dưới
    /*
    if (status === 'inactive') {
       const activeOrders = await pool.query(
         "SELECT * FROM orders WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled')", 
         [id]
       );
       if (activeOrders.rows.length > 0) {
         return res.status(400).json({ error: 'Không thể khóa bàn đang có khách (đơn hàng chưa đóng).' });
       }
    }
    */
    // ------------------------------------------

    const result = await pool.query(
      'UPDATE tables SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy bàn.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi Server.' });
  }
};

// 6. Generate QR 
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    // Check exist
    const check = await pool.query('SELECT id FROM tables WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Bàn không tồn tại' });

    const payload = {
      tableId: id,
      restaurantId: 'RES_001', // Hardcode cho bài tập
      timestamp: Date.now()
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key'); // Fallback key nếu chưa config env

    // Update DB (Auto invalidate old token)
    await pool.query(
      'UPDATE tables SET qr_token = $1, qr_token_created_at = NOW() WHERE id = $2',
      [token, id]
    );

    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?table=${id}&token=${token}`;
    const qrImage = await QRCode.toDataURL(menuUrl);

    res.json({ message: 'Tạo QR thành công', qrCodeImage: qrImage, menuUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tạo QR Code' });
  }
};

// 7. Download All QRs as ZIP
exports.downloadAllQRs = async (req, res) => {
  try {
    // Chỉ lấy các bàn đang active
    const result = await pool.query("SELECT * FROM tables WHERE status = 'active' ORDER BY table_number");
    const tables = result.rows;

    if (tables.length === 0) {
      return res.status(404).json({ error: 'Không có bàn nào để tải.' });
    }

    // Thiết lập Header để trình duyệt hiểu đây là file ZIP
    res.attachment('All_QRs.zip');

    const archive = archiver('zip', {
      zlib: { level: 9 } // Mức nén cao nhất
    });

    // Pipe dữ liệu nén trực tiếp vào response
    archive.pipe(res);

    // Duyệt qua từng bàn và tạo file ảnh trong ZIP
    for (const table of tables) {
      let token = table.qr_token;

      // Nếu bàn chưa có token, ta có thể tạo tạm thời (hoặc bỏ qua). 
      // Ở đây ta tạo token mới nếu thiếu để đảm bảo bàn nào cũng có QR.
      if (!token) {
        const payload = { tableId: table.id, restaurantId: 'RES_001', timestamp: Date.now() };
        token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key');
        // Lưu lại token mới vào DB (tùy chọn, để lần sau đỡ tạo lại)
        await pool.query('UPDATE tables SET qr_token = $1 WHERE id = $2', [token, table.id]);
      }

      const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?table=${table.id}&token=${token}`;

      // Tạo buffer ảnh QR
      const buffer = await QRCode.toBuffer(menuUrl);

      // Thêm file vào ZIP với tên: Table_T1.png
      archive.append(buffer, { name: `Table_${table.table_number}.png` });
    }

    // Kết thúc nén
    await archive.finalize();

  } catch (err) {
    console.error('Lỗi tạo ZIP:', err);
    // Lưu ý: Nếu header đã gửi rồi thì không thể gửi json error được nữa
    if (!res.headersSent) res.status(500).json({ error: 'Lỗi khi tạo file nén.' });
  }
};

// 8. Download All QRs as Single PDF (MỚI)
exports.downloadAllQRsPDF = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tables WHERE status = 'active' ORDER BY table_number");
    const tables = result.rows;

    if (tables.length === 0) return res.status(404).json({ error: 'Không có bàn nào.' });

    // 1. Khai báo đường dẫn tới Font (Sử dụng path để tránh lỗi đường dẫn)
    const fontRegular = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
    const fontBold = path.join(__dirname, '../fonts/Roboto-Bold.ttf');

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=All_Tables_QR.pdf',
    });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      if (i > 0) doc.addPage();

      // -- LOGIC TOKEN (Giữ nguyên) --
      let token = table.qr_token;
      if (!token) {
         const payload = { tableId: table.id, restaurantId: 'RES_001', timestamp: Date.now() };
         token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key');
         await pool.query('UPDATE tables SET qr_token = $1 WHERE id = $2', [token, table.id]);
      }
      const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?table=${table.id}&token=${token}`;
      const qrDataURL = await QRCode.toDataURL(menuUrl);
      const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, "");

      // -- VẼ PDF VỚI FONT TIẾNG VIỆT --
      
      // 1. Khung viền
      doc.rect(20, 20, 555, 802).stroke();

      // 2. Tiêu đề (Dùng Font Bold)
      doc.font(fontBold) // <-- Load font Bold
         .fontSize(30)
         .text('SMART RESTAURANT', { align: 'center', top: 100 });
      
      // 3. Số bàn
      doc.moveDown();
      doc.font(fontBold)
         .fontSize(20)
         .text(`BÀN : ${table.table_number}`, { align: 'center' });

      // 4. Ảnh QR
      doc.image(Buffer.from(base64Data, 'base64'), 197, 250, { width: 200 });

      // 5. Hướng dẫn
      doc.moveDown(13);
      doc.font(fontRegular) // <-- Load font Regular
         .fontSize(16)
         .text('SCAN TO ORDER', { align: 'center' });

      // 6. WiFi
      doc.moveDown();
      doc.fontSize(12)
         .text('WiFi: SmartRest_Guest\nPass: 88888888', { align: 'center', color: 'gray' });

      // 7. Footer
      doc.fontSize(10)
         .text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 0, 750, { align: 'center', width: 595 });
    }

    doc.end();

  } catch (err) {
    console.error('Lỗi tạo PDF:', err);
    // Nếu chưa gửi header thì báo lỗi JSON, nếu gửi rồi thì thôi
    if (!res.headersSent) res.status(500).send('Lỗi Server tạo PDF');
  }
};

// 9. Verify Token (Cho khách hàng quét QR) - Yêu cầu 4.2
exports.verifyQRToken = async (req, res) => {
  try {
    const { tableId, token } = req.query;

    if (!tableId || !token) {
      return res.status(400).json({ error: 'Thiếu thông tin bàn hoặc token.' });
    }

    // Lấy thông tin bàn từ DB
    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [tableId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bàn không tồn tại.' });
    }

    const table = result.rows[0];

    // So sánh Token gửi lên với Token trong Database
    if (table.qr_token !== token) {
      // LOGGING SECURITY (Yêu cầu 4.2)
      console.warn(`[SECURITY ALERT] Phát hiện token không hợp lệ tại bàn ${table.table_number}. IP: ${req.ip}`);
      
      return res.status(403).json({ 
        error: 'Mã QR này không còn hợp lệ.',
        message: 'Vui lòng liên hệ nhân viên để được hỗ trợ.' 
      });
    }

    // Nếu khớp -> Token hợp lệ -> Trả về thông tin bàn để hiển thị Menu
    res.json({
      valid: true,
      table: {
        id: table.id,
        number: table.table_number,
        location: table.location
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi xác thực hệ thống.' });
  }
};

// 10. Bulk Regenerate (Yêu cầu 4.3)
exports.regenerateAllQRs = async (req, res) => {
  try {
    // 1. Lấy tất cả bàn
    const result = await pool.query("SELECT id FROM tables");
    const tables = result.rows;
    let count = 0;

    // 2. Duyệt qua từng bàn và tạo token mới
    for (const table of tables) {
      const payload = {
        tableId: table.id,
        restaurantId: 'RES_001',
        timestamp: Date.now() // Timestamp mới -> Token mới
      };

      const newToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key');

      // 3. Update DB (Token cũ sẽ bị ghi đè -> Vô hiệu hóa ngay lập tức)
      await pool.query(
        'UPDATE tables SET qr_token = $1, qr_token_created_at = NOW() WHERE id = $2',
        [newToken, table.id]
      );
      count++;
    }

    // 4. Trả về Summary
    res.json({ 
      message: 'Đã làm mới mã QR thành công.', 
      updatedCount: count 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi Server khi làm mới hàng loạt.' });
  }
};

// 11. Get Unique Locations 
exports.getLocations = async (req, res) => {
  try {
    // Lấy các location duy nhất đang có trong DB
    const result = await pool.query("SELECT DISTINCT location FROM tables WHERE location IS NOT NULL ORDER BY location");
    
    // Trả về mảng dạng ['Indoor', 'Outdoor', 'Tầng 2', ...]
    const locations = result.rows.map(row => row.location);
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy danh sách khu vực' });
  }
};

// 12. Download Single QR 
exports.downloadSingleQR = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query; // ?format=png hoặc pdf (nếu muốn mở rộng)

    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bàn không tồn tại' });

    const table = result.rows[0];
    let token = table.qr_token;
    
    // Nếu chưa có token thì tạo mới (logic cũ)
    if (!token) {
        // ... (logic tạo token giống hàm generateQRCode) ...
        // Để ngắn gọn, ở đây giả sử đã có token hoặc bạn copy logic tạo token xuống
    }

    const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu?table=${table.id}&token=${token}`;
    
    // Tạo buffer ảnh PNG
    const buffer = await QRCode.toBuffer(menuUrl);

    // Trả về file cho trình duyệt tải xuống
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename=QR_Table_${table.table_number}.png`,
      'Content-Length': buffer.length
    });
    res.end(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi tải mã QR' });
  }
};