import { nanoid } from 'nanoid';
import Menu from '../models/Menu.js';
import { extractMenuData } from '../services/geminiService.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import QRCode from 'qrcode';

// GET /api/menus - List the logged-in manager's menus
export const getUserMenus = async (req, res) => {
  try {
    const menus = await Menu.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ menus });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch menus' });
  }
};

export const uploadAndExtract = async (req, res) => {
  try {
    const files = req.files?.length ? req.files : (req.file ? [req.file] : []);
    if (!files.length) {
      return res.status(400).json({ message: 'Please upload at least one menu image.' });
    }

    const { name, currency } = req.body;
    
    // 1. Upload all images to Cloudinary and extract dishes with Gemini concurrently
    const [cloudinaryResults, extractedDishes] = await Promise.all([
      Promise.all(files.map((file) => uploadToCloudinary(file.buffer, { folder: 'surebite/menus' }))),
      extractMenuData(files),
    ]);

    // 2. Map the dishes to our database schema
    const formattedItems = extractedDishes.map((dish) => ({
      ...dish,
      aiInferred: true,
      isVerified: false,
    }));

    // 3. Save draft to MongoDB with primary image and all image records
    const primary = cloudinaryResults[0];
    const newMenu = await Menu.create({
      owner: req.user._id,
      name: name?.trim() || 'New Draft',
      currency: currency || 'INR',
      status: 'draft',
      imageUrl: primary.secure_url,
      cloudinaryPublicId: primary.public_id,
      images: cloudinaryResults.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
      })),
      items: formattedItems,
    });

    return res.status(201).json({ menu: newMenu });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Menu processing failed.' });
  }
};

// GET /api/menus/:id
export const getMenuById = async (req, res) => {
  try {
    // Ensure the manager can only fetch their own menus
    const menu = await Menu.findOne({ _id: req.params.id, owner: req.user._id });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }
    return res.status(200).json({ menu });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch menu details.' });
  }
};

// PUT /api/menus/:id
export const updateMenu = async (req, res) => {
  try {
    const { name, currency, items } = req.body;
    
    const menu = await Menu.findOne({ _id: req.params.id, owner: req.user._id });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }

    // Update root menu fields
    if (name) menu.name = name;
    if (currency) menu.currency = currency;
    
    // Completely replace items array with the manager's verified edits[cite: 41]
    if (items) {
      menu.items = items;
    }

    await menu.save();
    return res.status(200).json({ menu });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to save menu edits.' });
  }
};

// PATCH /api/menus/:id/publish
export const publishMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne({ _id: req.params.id, owner: req.user._id });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }

    // Gatekeeper Rule: Reject if empty or if any dish is unverified
    if (menu.items.length === 0 || menu.items.some(dish => dish.isVerified === false)) {
      return res.status(400).json({ 
        message: 'Every dish must be verified before the menu can be published.' 
      });
    }

    // Set published status, generate 10-char slug, and set timestamp
    menu.status = 'published';
    menu.slug = nanoid(10);
    menu.publishedAt = new Date().toISOString();

    await menu.save();
    
    return res.status(200).json({ menu });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to publish menu.' });
  }
};

// GET /api/menus/:id/qr
export const getQrCode = async (req, res) => {
  try {
    const menu = await Menu.findOne({ _id: req.params.id, owner: req.user._id });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }

    // Guard: Only generate QR codes for published menus
    if (menu.status !== 'published' || !menu.slug) {
      return res.status(400).json({ message: 'Menu must be published to generate a QR code.' });
    }

    // Construct the public URL for the diner
    const publicUrl = `${process.env.CLIENT_URL}/m/${menu.slug}`;

    // Generate both PNG and SVG formats as required by the frontend
    const qrPng = await QRCode.toDataURL(publicUrl, { width: 1024, margin: 2 });
    const qrSvg = await QRCode.toString(publicUrl, { type: 'svg', margin: 2 });

    return res.status(200).json({
      publicUrl,
      qrPng,
      qrSvg
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate QR code.' });
  }
};

// DELETE /api/menus/:id
export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found.' });
    }

    // Clean up all uploaded images in Cloudinary
    const publicIds = [
      ...(menu.images?.map((img) => img.publicId) || []),
      menu.cloudinaryPublicId,
    ].filter(Boolean);

    [...new Set(publicIds)].forEach((id) =>
      deleteFromCloudinary(id).catch((err) =>
        console.warn('Failed to delete image from Cloudinary:', err.message)
      )
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete menu.' });
  }
};