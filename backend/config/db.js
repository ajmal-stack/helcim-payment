const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB Atlas connection URI
    const uri = "mongodb+srv://uniqueiitpvt:myproject@stone-crusher-erp.qy5fhgf.mongodb.net/helcim";
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 