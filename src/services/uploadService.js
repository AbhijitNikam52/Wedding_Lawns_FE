import api from "./api";

// Upload photos — files is a FileList or array of File objects
export const uploadLawnPhotos = (lawnId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("photos", file));

  return api
    .post(`/upload/lawn-photos/${lawnId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

// Delete one photo by its Cloudinary URL
export const deleteLawnPhoto = (lawnId, photoUrl) =>
  api
    .delete(`/upload/lawn-photos/${lawnId}`, { data: { photoUrl } })
    .then((r) => r.data);

// Save reordered photos array
export const reorderLawnPhotos = (lawnId, photos) =>
  api
    .put(`/upload/lawn-photos/${lawnId}/reorder`, { photos })
    .then((r) => r.data);