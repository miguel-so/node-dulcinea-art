import bcrypt from 'bcryptjs';
import { User } from '../models';

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.log('Super admin credentials not provided in environment variables');
      return;
    }

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({
      where: { 
        email: superAdminEmail,
        role: 'super_admin'
      }
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminPassword, salt);

    // Create super admin
    await User.create({
      username: 'Super Admin',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      bio: 'System Administrator'
    });

    console.log('Super admin created successfully');
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
};
