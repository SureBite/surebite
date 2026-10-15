import Menu from '../models/Menu.js';

// GET /api/diner/:slug
export const getPublicMenu = async (req, res) => {
  try {
    // Find the menu by its unique slug and get the owner's restaurantName
    const menu = await Menu.findOne({ slug: req.params.slug })
      .populate('owner', 'restaurantName');

    // Guard: Return 404 if menu doesn't exist or isn't published yet
    if (!menu || menu.status !== 'published') {
      return res.status(404).json({ message: 'This menu is not available.' });
    }

    // Convert Mongoose document to a plain JavaScript object
    const menuObj = menu.toObject();

    // Sanitization: Inject the restaurantName directly into the menu object[cite: 7]
    menuObj.restaurantName = menuObj.owner.restaurantName;
    
    // Completely remove the owner object so no private manager data is leaked to guests[cite: 7]
    delete menuObj.owner;

    return res.status(200).json({ menu: menuObj });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load the menu.' });
  }
};

// POST /api/diner/:slug/scan
export const recordScan = async (req, res) => {
  // This is a simple telemetry endpoint the frontend hits when a QR is scanned[cite: 5]
  return res.status(200).json({ success: true });
};
