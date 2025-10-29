import { Request, Response } from 'express';
import { sendEmail } from '../utils/sendEmail';
import { Artwork, User } from '../models';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  artworkId?: string;
  artistId?: string;
}

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, artworkId, artistId }: ContactForm = req.body;

    let artistEmail = '';
    let artistName = '';
    let artworkTitle = '';

    // Get artist information
    if (artistId) {
      const artist = await User.findByPk(artistId);
      if (artist) {
        artistEmail = artist.email;
        artistName = artist.username;
      }
    }

    // Get artwork information if provided
    if (artworkId) {
      const artwork = await Artwork.findByPk(artworkId, {
        include: [
          {
            model: User,
            as: 'artist',
            attributes: ['name', 'email']
          }
        ]
      });
      if (artwork) {
        artworkTitle = artwork.title;
        if (!artistEmail && (artwork as any).artist) {
          artistEmail = (artwork as any).artist.email;
          artistName = (artwork as any).artist.name;
        }
      }
    }

    if (!artistEmail) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    // Create email message for artist
    const artistMessage = `
Hello ${artistName},

You have received a new inquiry about your artwork${artworkTitle ? ` "${artworkTitle}"` : ''}.

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

Please respond directly to ${email} to continue the conversation.

Best regards,
Dulcinea-Art Team
    `;

    // Create email message for customer (confirmation)
    const customerMessage = `
Hello ${name},

Thank you for your interest in the artwork${artworkTitle ? ` "${artworkTitle}"` : ''} by ${artistName}.

Your message has been sent to the artist, and they will respond directly to you at ${email}.

Your message:
Subject: ${subject}
Message: ${message}

We hope you find the perfect artwork for your collection!

Best regards,
Dulcinea-Art Team
    `;

    // Send email to artist
    await sendEmail({
      email: artistEmail,
      subject: `New Artwork Inquiry: ${subject}`,
      message: artistMessage
    });

    // Send confirmation email to customer
    await sendEmail({
      email: email,
      subject: `Confirmation: Your message to ${artistName}`,
      message: customerMessage
    });

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
