import { upload } from "../middlewares/multer.middleware.js";
import cloudinary from "../config/cloudinary.js";
import { runMulterSingle } from "../utils/multer.util.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.util.js";

export const subirImagen = async (req, res) => {
    try {
        await runMulterSingle(upload, "imagen", req, res);

        if (!req.file) {
            return res.status(400).json({ error: "No se subió ningún archivo" });
        }

        // Permitir especificar carpeta vía req.body.folder, por defecto 'uploads'
        const folder = req.body?.folder || "uploads";

        // Sube el buffer a Cloudinary usando la utilidad promisificada
        const result = await uploadBufferToCloudinary(cloudinary, req.file.buffer, {
            resource_type: "auto",
            folder,
        });

        return res.json({ url: result.secure_url, folder: result.folder });
    } catch (error) {
        console.error("Error al subir imagen:", error);
        return res.status(500).json({ error: "Error al subir imagen" });
    }
};