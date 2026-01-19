import multer from 'multer';
import fs from 'fs';
import path from 'path';

// 1. Configure where to save the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files in a 'uploads' folder in your project root
    const uploadPath = 'uploads/';
    
    // Create the folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Save as: timestamp-filename.csv (to prevent duplicate names)
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 2. Filter: Only accept CSV files
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only .csv files are allowed!'), false);
  }
};

// 3. Export the middleware
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
});