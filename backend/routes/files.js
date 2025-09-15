import { Router } from 'express';
import { nanoid } from 'nanoid';
import FileItem from '../models/FileItem.js';
import { presignGet, presignPut, deleteObject } from '../src/s3.js';

const router = Router()

// 업로드용 PUT 프리사인드 URL
r.post("/presign", async (req, res) => {

});





export default router;
