import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";
import { ArtworkStatus } from "../utils/types";

interface ArtworkAttributes {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string; // single main image
  images?: string[]; // multiple image filenames
  size: string;
  media?: string;
  printNumber?: string;
  inventoryNumber?: string;
  status: ArtworkStatus;
  price?: number;
  location?: string;
  notes?: string;
  sold: boolean;
  artistId: number;
  categoryId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ArtworkCreationAttributes
  extends Optional<
    ArtworkAttributes,
    | "id"
    | "description"
    | "thumbnail"
    | "images"
    | "media"
    | "printNumber"
    | "inventoryNumber"
    | "price"
    | "location"
    | "notes"
    | "sold"
    | "categoryId"
    | "tags"
    | "createdAt"
    | "updatedAt"
  > {}

class Artwork
  extends Model<ArtworkAttributes, ArtworkCreationAttributes>
  implements ArtworkAttributes
{
  public id!: number;
  public title!: string;
  public description?: string;
  public thumbnail!: string;
  public images?: string[];
  public size!: string;
  public media?: string;
  public printNumber?: string;
  public inventoryNumber?: string;
  public status!: ArtworkStatus;
  public price?: number;
  public location?: string;
  public notes?: string;
  public sold!: boolean;
  public artistId!: number;
  public categoryId?: string;
  public tags?: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Artwork.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    media: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    printNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    inventoryNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        ArtworkStatus.AVAILABLE,
        ArtworkStatus.ON_HOLD,
        ArtworkStatus.ON_EXHIBIT,
        ArtworkStatus.SOLD
      ),
      allowNull: false,
      defaultValue: ArtworkStatus.AVAILABLE,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    artistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Artwork",
    tableName: "artworks",
    timestamps: true,
    indexes: [
      { fields: ["artistId"] },
      { fields: ["sold"] },
      { fields: ["categoryId"] },
      { type: "FULLTEXT", fields: ["title", "description"] },
    ],
  }
);

// Define associations
User.hasMany(Artwork, { foreignKey: "artistId", as: "artworks" });
Artwork.belongsTo(User, { foreignKey: "artistId", as: "artist" });

export default Artwork;
