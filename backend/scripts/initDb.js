const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Product = require("../models/productModel");

dotenv.config();

// Curated list of products with guaranteed images
const dummyProducts = [
  {
    name: "Traditional Nepali Tea Set",
    description: "Handcrafted ceramic tea set with traditional Nepali patterns",
    price: 49.99,
    category: "Home & Kitchen",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&w=500&q=80",
    stock: 25,
  },
  {
    name: "Pashmina Shawl - Royal Blue",
    description: "Luxurious 100% cashmere pashmina shawl in royal blue",
    price: 129.99,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1589459072535-550f4fae08d2?auto=format&w=500&q=80",
    stock: 30,
  },
  {
    name: "Handmade Singing Bowl",
    description: "Traditional Tibetan singing bowl for meditation and healing",
    price: 79.99,
    category: "Spiritual",
    image:
      "https://images.unsplash.com/photo-1593260654784-4aa2e5c11ecf?auto=format&w=500&q=80",
    stock: 15,
  },
  {
    name: "Nepali Spice Collection",
    description: "Authentic blend of traditional Nepali spices",
    price: 34.99,
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&w=500&q=80",
    stock: 40,
  },
  {
    name: "Buddha Wall Art",
    description: "Hand-painted Buddha artwork on canvas",
    price: 299.99,
    category: "Art",
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&w=500&q=80",
    stock: 10,
  },
];

// Category-specific image collections
const categoryImages = {
  Fashion: [
    "https://images.unsplash.com/photo-1589459072535-550f4fae08d2",
    "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f",
    "https://images.unsplash.com/photo-1589459072535-550f4fae08d2",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
  ],
  "Home & Kitchen": [
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8",
    "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf",
    "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c",
    "https://images.unsplash.com/photo-1565183928294-7063f23ce0f8",
  ],
  Art: [
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3",
    "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec",
  ],
  Spiritual: [
    "https://images.unsplash.com/photo-1593260654784-4aa2e5c11ecf",
    "https://images.unsplash.com/photo-1605648916361-9bc12ad6a569",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd",
    "https://images.unsplash.com/photo-1600076619855-fb6f4275d722",
  ],
  Food: [
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd",
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  ],
  Jewelry: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a",
    "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584",
  ],
  Handicrafts: [
    "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad",
    "https://images.unsplash.com/photo-1544967082-d9d25d867d66",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    "https://images.unsplash.com/photo-1606722590733-9526b330de00",
  ],
};

// Product templates for each category
const productTemplates = {
  Fashion: [
    "Pashmina Shawl",
    "Traditional Dress",
    "Handwoven Scarf",
    "Nepali Hat",
  ],
  "Home & Kitchen": ["Tea Set", "Copper Vessel", "Bamboo Basket", "Clay Pot"],
  Art: ["Thangka Painting", "Wall Hanging", "Bronze Statue", "Wood Carving"],
  Spiritual: [
    "Singing Bowl",
    "Prayer Beads",
    "Meditation Cushion",
    "Incense Set",
  ],
  Food: [
    "Spice Collection",
    "Tea Blend",
    "Traditional Snacks",
    "Himalayan Salt",
  ],
  Jewelry: [
    "Silver Necklace",
    "Traditional Earrings",
    "Beaded Bracelet",
    "Gemstone Ring",
  ],
  Handicrafts: ["Woven Basket", "Pottery Set", "Wool Carpet", "Bamboo Craft"],
};

// Generate products with guaranteed images
const generateProducts = () => {
  const products = [...dummyProducts];

  Object.keys(categoryImages).forEach((category) => {
    const images = categoryImages[category];
    const templates = productTemplates[category];

    templates.forEach((template, index) => {
      const price = (Math.random() * 200 + 20).toFixed(2);
      products.push({
        name: `Nepali ${template}`,
        description: `Authentic handcrafted ${template.toLowerCase()} made by skilled Nepali artisans`,
        price: parseFloat(price),
        category,
        image: `${images[index]}?auto=format&w=500&q=80`,
        stock: Math.floor(Math.random() * 30) + 10,
      });
    });
  });

  return products;
};

const initializeDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin User",
      email: "admin@nepalimart.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Created admin user");

    // Create test user
    const userHashedPassword = await bcrypt.hash("user123", 10);
    await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: userHashedPassword,
      role: "user",
    });
    console.log("Created test user");

    // Generate and add products
    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`Added ${products.length} products with images`);

    console.log("Database initialization completed");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};

initializeDb();
