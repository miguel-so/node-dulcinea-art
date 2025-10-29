// import { Request, Response } from 'express';
// import { Artwork } from '../models';

// // @desc    Get artist's artworks
// // @route   GET /api/artist/artworks
// // @access  Private (Artist only)
// export const getArtistArtworks = async (req: Request, res: Response) => {
//   try {
//     const artistId = (req as any).user.id;
//     const { page = 1, limit = 10, search, category, sold } = req.query;
//     const offset = (Number(page) - 1) * Number(limit);

//     const whereClause: any = { artistId };
    
//     if (search) {
//       whereClause[require('sequelize').Op.or] = [
//         { title: { [require('sequelize').Op.like]: `%${search}%` } },
//         { description: { [require('sequelize').Op.like]: `%${search}%` } }
//       ];
//     }
    
//     if (category) {
//       whereClause.category = category;
//     }
    
//     if (sold !== undefined) {
//       whereClause.sold = sold === 'true';
//     }

//     const { count, rows: artworks } = await Artwork.findAndCountAll({
//       where: whereClause,
//       limit: Number(limit),
//       offset,
//       order: [['createdAt', 'DESC']]
//     });

//     res.json({
//       success: true,
//       data: {
//         artworks,
//         pagination: {
//           currentPage: Number(page),
//           totalPages: Math.ceil(count / Number(limit)),
//           totalItems: count,
//           itemsPerPage: Number(limit)
//         }
//       }
//     });
//   } catch (error: any) {
//     console.error('Get artist artworks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch artworks'
//     });
//   }
// };

// // @desc    Create new artwork
// // @route   POST /api/artist/artworks
// // @access  Private (Artist only)
// export const createArtwork = async (req: Request, res: Response) => {
//   try {
//     const artistId = (req as any).user.id;
//     const artworkData = {
//       ...req.body,
//       artistId
//     };

//     const artwork = await Artwork.create(artworkData);

//     res.status(201).json({
//       success: true,
//       data: artwork,
//       message: 'Artwork created successfully'
//     });
//   } catch (error: any) {
//     console.error('Create artwork error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create artwork'
//     });
//   }
// };

// // @desc    Update artwork
// // @route   PUT /api/artist/artworks/:id
// // @access  Private (Artist only)
// export const updateArtwork = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const artistId = (req as any).user.id;

//     const artwork = await Artwork.findOne({
//       where: { id, artistId }
//     });

//     if (!artwork) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artwork not found or you do not have permission to update it'
//       });
//     }

//     await artwork.update(req.body);

//     res.json({
//       success: true,
//       data: artwork,
//       message: 'Artwork updated successfully'
//     });
//   } catch (error: any) {
//     console.error('Update artwork error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update artwork'
//     });
//   }
// };

// // @desc    Delete artwork
// // @route   DELETE /api/artist/artworks/:id
// // @access  Private (Artist only)
// export const deleteArtwork = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const artistId = (req as any).user.id;

//     const artwork = await Artwork.findOne({
//       where: { id, artistId }
//     });

//     if (!artwork) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artwork not found or you do not have permission to delete it'
//       });
//     }

//     await artwork.destroy();

//     res.json({
//       success: true,
//       message: 'Artwork deleted successfully'
//     });
//   } catch (error: any) {
//     console.error('Delete artwork error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete artwork'
//     });
//   }
// };
