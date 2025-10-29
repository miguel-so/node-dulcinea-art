import { Request, Response } from 'express';
import { User } from '../models';
import { Artwork } from '../models';

// @desc    Get all users (artists)
// @route   GET /api/admin/users
// @access  Private (Super Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const offset = (page - 1) * limit;

  try {
    const users = await User.findAll({
      offset,
      limit,
      attributes: {
        exclude: [
          'password',
          'resetPasswordToken',
          'resetPasswordExpire',
          'emailVerificationToken',
          'emailVerificationExpire',
          'resetPasswordCode',
          'resetPasswordCodeExpire',
        ],
      },
    });

    const totalCount = await User.count();

    res.json({
      users,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Super Admin only)
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'artist') {
      return res.status(400).json({
        success: false,
        message: 'Can only toggle status of artist accounts',
      });
    }

    // Toggle the status
    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      },
      message: `User ${
        user.isActive ? 'activated' : 'deactivated'
      } successfully`,
    });
  } catch (error: any) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

// @desc    Get all artworks (for super admin)
// @route   GET /api/admin/artworks
// @access  Private (Super Admin only)
export const getAllArtworks = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, category, sold } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (sold !== undefined) {
      whereClause.sold = sold === 'true';
    }

    const { count, rows: artworks } = await Artwork.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'artist',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        artworks,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get artworks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artworks',
    });
  }
};

// @desc    Delete artwork (super admin)
// @route   DELETE /api/admin/artworks/:id
// @access  Private (Super Admin only)
export const deleteArtwork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findByPk(id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    await artwork.destroy();

    res.json({
      success: true,
      message: 'Artwork deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artwork',
    });
  }
};
