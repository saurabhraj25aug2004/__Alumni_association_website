const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Job = require('./models/Job');
const Workshop = require('./models/Workshop');
const Blog = require('./models/Blog');
const Feedback = require('./models/Feedback');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample data arrays
const sampleUsers = [
  // Admins
  {
    name: 'Admin User',
    email: 'admin@alumni.com',
    password: 'admin123456',
    role: 'admin',
    isApproved: true,
    bio: 'Platform administrator with 5+ years of experience.',
    phone: '+1-555-0101',
    location: 'New York, NY'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@alumni.com',
    password: 'admin123456',
    role: 'admin',
    isApproved: true,
    bio: 'Senior administrator focused on community engagement.',
    phone: '+1-555-0102',
    location: 'San Francisco, CA'
  },
  // Alumni
  {
    name: 'Michael Chen',
    email: 'michael.chen@alumni.com',
    password: 'password123',
    role: 'alumni',
    isApproved: true,
    graduationYear: 2018,
    major: 'Computer Science',
    bio: 'Senior Software Engineer at Google.',
    phone: '+1-555-0201',
    location: 'Mountain View, CA'
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@alumni.com',
    password: 'password123',
    role: 'alumni',
    isApproved: true,
    graduationYear: 2019,
    major: 'Business Administration',
    bio: 'Product Manager at Microsoft.',
    phone: '+1-555-0202',
    location: 'Seattle, WA'
  },
  {
    name: 'David Kim',
    email: 'david.kim@alumni.com',
    password: 'password123',
    role: 'alumni',
    isApproved: true,
    graduationYear: 2020,
    major: 'Electrical Engineering',
    bio: 'Hardware Engineer at Tesla.',
    phone: '+1-555-0203',
    location: 'Palo Alto, CA'
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa.thompson@alumni.com',
    password: 'password123',
    role: 'alumni',
    isApproved: true,
    graduationYear: 2021,
    major: 'Marketing',
    bio: 'Digital Marketing Director at Nike.',
    phone: '+1-555-0204',
    location: 'Portland, OR'
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@alumni.com',
    password: 'password123',
    role: 'alumni',
    isApproved: true,
    graduationYear: 2022,
    major: 'Data Science',
    bio: 'Data Scientist at Netflix.',
    phone: '+1-555-0205',
    location: 'Los Gatos, CA'
  },
  // Students
  {
    name: 'Alex Martinez',
    email: 'alex.martinez@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2025,
    major: 'Computer Science',
    bio: 'Junior student passionate about web development.',
    phone: '+1-555-0301',
    location: 'Austin, TX'
  },
  {
    name: 'Sophia Lee',
    email: 'sophia.lee@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2025,
    major: 'Business Administration',
    bio: 'Business student with interest in entrepreneurship.',
    phone: '+1-555-0302',
    location: 'Boston, MA'
  },
  {
    name: 'Ryan Park',
    email: 'ryan.park@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2026,
    major: 'Mechanical Engineering',
    bio: 'Engineering student focused on renewable energy.',
    phone: '+1-555-0303',
    location: 'Denver, CO'
  },
  {
    name: 'Maya Patel',
    email: 'maya.patel@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2026,
    major: 'Psychology',
    bio: 'Psychology student interested in cognitive science.',
    phone: '+1-555-0304',
    location: 'Chicago, IL'
  },
  {
    name: 'Kevin O\'Connor',
    email: 'kevin.oconnor@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2025,
    major: 'Finance',
    bio: 'Finance student with passion for fintech.',
    phone: '+1-555-0305',
    location: 'New York, NY'
  },
  {
    name: 'Nina Garcia',
    email: 'nina.garcia@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2026,
    major: 'Graphic Design',
    bio: 'Design student specializing in UI/UX design.',
    phone: '+1-555-0306',
    location: 'Miami, FL'
  },
  {
    name: 'Tom Anderson',
    email: 'tom.anderson@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2025,
    major: 'Environmental Science',
    bio: 'Environmental science student focused on sustainability.',
    phone: '+1-555-0307',
    location: 'Portland, OR'
  },
  {
    name: 'Zoe Williams',
    email: 'zoe.williams@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2026,
    major: 'Communications',
    bio: 'Communications student interested in digital media.',
    phone: '+1-555-0308',
    location: 'Los Angeles, CA'
  },
  {
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2025,
    major: 'Computer Engineering',
    bio: 'Computer engineering student passionate about IoT.',
    phone: '+1-555-0309',
    location: 'San Diego, CA'
  },
  {
    name: 'Aisha Khan',
    email: 'aisha.khan@student.com',
    password: 'password123',
    role: 'student',
    isApproved: true,
    graduationYear: 2026,
    major: 'Biotechnology',
    bio: 'Biotechnology student focused on genetic engineering.',
    phone: '+1-555-0310',
    location: 'Houston, TX'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Workshop.deleteMany({});
    await Blog.deleteMany({});
    await Feedback.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Get user references for different roles
    const admins = createdUsers.filter(user => user.role === 'admin');
    const alumni = createdUsers.filter(user => user.role === 'alumni');
    const students = createdUsers.filter(user => user.role === 'student');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length} (${admins.length} admins, ${alumni.length} alumni, ${students.length} students)`);
    console.log('\n🔑 Default Login Credentials:');
    console.log('Admin: admin@alumni.com / admin123456');
    console.log('Alumni: michael.chen@alumni.com / password123');
    console.log('Student: alex.martinez@student.com / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

runSeed();
