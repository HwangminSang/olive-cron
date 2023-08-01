import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

// type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

export const multerConfig = {
  storage: multer.diskStorage({
    destination: 'uploads',
    filename: function (req: Request, file: Express.Multer.File, cb: FileNameCallback) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      // cb(null, 'kr_cs_center' + '-' + uniqueSuffix)
      cb(null, file.originalname)
    },
  }),

  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'text/csv') {
      console.log(file.originalname)
      return cb(null, true)
    }
    cb(null, false)
  },

  limits: { fileSize: 1024 * 1024 * 20 }, // 20 MB로 제한
}
