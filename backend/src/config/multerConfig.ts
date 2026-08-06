import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },  

    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        cb(
            null,
            `${Date.now()}-${crypto.randomUUID()}${ext}`
        );
    },
});

const fileFilter: multer.Options["fileFilter"] = (
    req,
    file,
    cb
) => {
    if (file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF files allowed"));
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export default upload;