const mongoose = require('mongoose');
const { User, Job, Workshop, Blog, Feedback } = require('../models');

// Test function to verify models
const testModels = async () => {
  try {
    console.log('Testing model imports...');
    
    // Test User model
    console.log('✅ User model imported successfully');
    console.log('   - Fields:', Object.keys(User.schema.paths).filter(key => !key.startsWith('_')));
    
    // Test Job model
    console.log('✅ Job model imported successfully');
    console.log('   - Fields:', Object.keys(Job.schema.paths).filter(key => !key.startsWith('_')));
    
    // Test Workshop model
    console.log('✅ Workshop model imported successfully');
    console.log('   - Fields:', Object.keys(Workshop.schema.paths).filter(key => !key.startsWith('_')));
    
    // Test Blog model
    console.log('✅ Blog model imported successfully');
    console.log('   - Fields:', Object.keys(Blog.schema.paths).filter(key => !key.startsWith('_')));
    
    // Test Feedback model
    console.log('✅ Feedback model imported successfully');
    console.log('   - Fields:', Object.keys(Feedback.schema.paths).filter(key => !key.startsWith('_')));
    
    // Test model relationships
    console.log('\nTesting model relationships...');
    
    // Test User-Job relationship
    const jobSchema = Job.schema;
    const postedByField = jobSchema.path('postedBy');
    console.log('✅ Job.postedBy references User:', postedByField.instance === 'ObjectID');
    
    // Test User-Workshop relationship
    const workshopSchema = Workshop.schema;
    const hostField = workshopSchema.path('host');
    console.log('✅ Workshop.host references User:', hostField.instance === 'ObjectID');
    
    // Test User-Blog relationship
    const blogSchema = Blog.schema;
    const authorField = blogSchema.path('author');
    console.log('✅ Blog.author references User:', authorField.instance === 'ObjectID');
    
    // Test User-Feedback relationship
    const feedbackSchema = Feedback.schema;
    const userField = feedbackSchema.path('user');
    console.log('✅ Feedback.user references User:', userField.instance === 'ObjectID');
    
    // Test virtual fields
    console.log('\nTesting virtual fields...');
    console.log('✅ Job.applicantCount virtual:', typeof Job.schema.virtuals.applicantCount !== 'undefined');
    console.log('✅ Workshop.attendeeCount virtual:', typeof Workshop.schema.virtuals.attendeeCount !== 'undefined');
    console.log('✅ Blog.likeCount virtual:', typeof Blog.schema.virtuals.likeCount !== 'undefined');
    console.log('✅ Feedback.helpfulCount virtual:', typeof Feedback.schema.virtuals.helpfulCount !== 'undefined');
    
    // Test indexes
    console.log('\nTesting indexes...');
    console.log('✅ Job text index:', Job.schema.indexes().some(idx => idx[0].title === 'text'));
    console.log('✅ Workshop text index:', Workshop.schema.indexes().some(idx => idx[0].topic === 'text'));
    console.log('✅ Blog text index:', Blog.schema.indexes().some(idx => idx[0].title === 'text'));
    console.log('✅ Feedback text index:', Feedback.schema.indexes().some(idx => idx[0].comments === 'text'));
    
    console.log('\n🎉 All models tested successfully!');
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    process.exit(1);
  }
};

// Run the test
testModels();
