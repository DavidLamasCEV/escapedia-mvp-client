import axios from 'axios'

export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Faltan variables de entorno de Cloudinary')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const res = await axios.post(url, formData)
  return res.data.secure_url
}
