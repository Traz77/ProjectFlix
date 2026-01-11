const UserServices = require('../services/UserServices');
const { verifyToken } = require('../jwt');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('[DEBUG] Auth: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // console.log('[DEBUG] Auth: Token decoded', decoded);
    const user = await UserServices.getUserById(decoded.userId);
    if (!user) {
      console.log('[DEBUG] Auth: User not found for ID', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = decoded.userId;
    console.log('[DEBUG] Auth: Success. UserID:', req.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await UserServices.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { requireAuth, requireAdmin };