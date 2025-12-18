const validateTableInput = (req, res, next) => {
  const { table_number, capacity, status } = req.body;

  if (req.method === 'POST' || req.method === 'PUT') {
    if (!table_number || table_number.trim() === '') {
      return res.status(400).json({ error: 'Tên/Số bàn là bắt buộc.' });
    }
    
    // Validate Capacity
    if (!capacity || isNaN(capacity)) {
      return res.status(400).json({ error: 'Sức chứa phải là số.' });
    }
    const capNum = parseInt(capacity);
    if (capNum < 1 || capNum > 20) {
      return res.status(400).json({ error: 'Sức chứa phải từ 1 đến 20 người.' });
    }
  }

  // Validate Status
  if (req.body.status && !['active', 'inactive'].includes(req.body.status)) {
     return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
  }

  next();
};

module.exports = { validateTableInput };