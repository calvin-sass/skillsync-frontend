import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiCreateService, apiUploadServiceImage, apiGetServiceById, apiUpdateService, apiDeleteServiceImage } from '../../services/api';
import type { ServiceCreateDto, ServiceUpdateDto } from '../../types';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-primary-200 border-t-primary-600`} />
    </div>
  );
};

interface FormData {
  title: string;
  description: string;
  category: string;
  price: string;
}

// Custom delete confirmation modal component
interface DeleteImageModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteImageModal: React.FC<DeleteImageModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-2 text-center">Delete Image</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 text-center">
              Are you sure you want to delete this image?<br/>
              This will permanently remove the image from cloud storage.
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-3 px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SellerAddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceIdToEdit = searchParams.get('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{id: number, imageUrl: string}[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    price: ''
  });

  // Fetch service data if in edit mode
  const { data: serviceData, isLoading: isLoadingService } = useQuery({
    queryKey: ['service', serviceIdToEdit],
    queryFn: () => apiGetServiceById(Number(serviceIdToEdit)),
    enabled: !!serviceIdToEdit,
  });

  // Effect to set form data when service data is loaded
  useEffect(() => {
    if (serviceData) {
      setIsEditMode(true);
      setFormData({
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: serviceData.price.toString()
      });
      
      // Set existing images if available
      if (serviceData.images && serviceData.images.length > 0) {
        setExistingImages(serviceData.images);
        const imageUrls = serviceData.images.map(img => img.imageUrl);
        setImagePreviews(imageUrls);
      }
    }
  }, [serviceData]);

  // Handle error for service fetch
  useEffect(() => {
    if (serviceIdToEdit && !isLoadingService && !serviceData) {
      setErrorMessage('Failed to load service. Please try again.');
    }
  }, [serviceIdToEdit, isLoadingService, serviceData]);

  const categories = [
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'Video',
    'Music',
    'Business',
    'Lifestyle'
  ];

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceCreateDto) => apiCreateService(data),
    onSuccess: async (createdService) => {
      setSuccessMessage('Service created successfully!');
      
      // If there are images to upload, upload them
      if (imageFiles.length > 0) {
        await uploadImages(createdService.id);
      } else {
        // No images to upload, redirect after a short delay
        setTimeout(() => {
          navigate(`/seller/services`);
        }, 1500);
      }
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || 'Failed to create service. Please try again.');
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: ServiceUpdateDto }) => apiUpdateService(id, data),
    onSuccess: async () => {
      setSuccessMessage('Service updated successfully!');
      
      // If there are images to upload, upload them
      if (imageFiles.length > 0) {
        await uploadImages(Number(serviceIdToEdit));
      } else {
        // No images to upload, redirect after a short delay
        setTimeout(() => {
          navigate(`/seller/services`);
        }, 1500);
      }
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || 'Failed to update service. Please try again.');
    }
  });

  // Upload images mutation
  const uploadImageMutation = useMutation({
    mutationFn: ({ serviceId, image }: { serviceId: number, image: File }) => {
      return apiUploadServiceImage(serviceId, image);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Calculate how many more images we can add (max 5 total)
    const maxFiles = 5 - (existingImages.length + imageFiles.length);
    if (maxFiles <= 0) {
      setErrorMessage('Maximum of 5 images allowed. Please remove some existing images first.');
      return;
    }
    
    const newFiles = Array.from(files).slice(0, maxFiles);
    setImageFiles([...imageFiles, ...newFiles]);
    
    // Create previews for new images
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset the file input value so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImageDeletion = async () => {
    if (imageToDeleteIndex === null || !serviceIdToEdit) return;
    
    const index = imageToDeleteIndex;
    const imageToDelete = existingImages[index];
    
    // Show loading state
    setUploadingImages(true);
    setSuccessMessage('Deleting image... Please wait.');
    
    try {
      // Immediately delete the image from the server instead of just marking it
      await apiDeleteServiceImage(parseInt(serviceIdToEdit), imageToDelete.id);
      
      // Remove from existing images array
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      
      // Update preview arrays to match
      setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
      
      // Show success message for better feedback
      setSuccessMessage(`Image successfully deleted from the service.`);
      console.log(`Successfully deleted image ${imageToDelete.id} from service ${serviceIdToEdit}`);
    } catch (error: any) {
      console.error(`Failed to delete image ${imageToDelete.id}:`, error);
      setErrorMessage(`Failed to delete image: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      // Reset states
      setUploadingImages(false);
      setShowDeleteModal(false);
      setImageToDeleteIndex(null);
      
      // Clear success message after a delay
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };  

  const removeImage = (index: number) => {
    // For newly added images (not yet saved), delete without confirmation
    if (!isEditMode || (isEditMode && index >= existingImages.length)) {
      const adjustedIndex = isEditMode ? index - existingImages.length : index;
      setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== adjustedIndex));
      setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
      return;
    }
    
    // For existing images, show confirmation modal
    setImageToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const validateForm = (): boolean => {
    setErrorMessage('');
    
    // Validate basic info
    if (!formData.title || !formData.description || !formData.category) {
      setErrorMessage('Please fill in all required fields in the Basic Information section.');
      return false;
    }
    
    // Validate price
    if (!formData.price) {
      setErrorMessage('Please enter a price for your service.');
      return false;
    }
    
    // Validate price is a number
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setErrorMessage('Please enter a valid price.');
      return false;
    }
    
    return true;
  };

  const uploadImages = async (serviceId: number) => {
    setUploadingImages(true);
    let hasErrors = false;
    const uploadErrors: string[] = [];
    
    try {
      // Then upload any new images
      if (imageFiles.length > 0) {
        setSuccessMessage(`Uploading ${imageFiles.length} new image(s) to Cloudinary...`);
        
        // Process uploads with better error tracking
        for (const image of imageFiles) {
          try {
            const result = await uploadImageMutation.mutateAsync({ serviceId, image });
            console.log(`Successfully uploaded image ${image.name} to Cloudinary:`, result);
          } catch (error: any) {
            console.error(`Failed to upload image ${image.name} to Cloudinary:`, error);
            const errorMessage = error.response?.data?.message || image.name;
            uploadErrors.push(errorMessage);
            hasErrors = true;
          }
        }
      }
      
      // Set appropriate message based on success/partial success
      if (hasErrors) {
        let errorMsg = 'Service updated but some Cloudinary image operations failed:';
        
        if (uploadErrors.length > 0) {
          errorMsg += ` Failed to upload: ${uploadErrors.join(', ')}.`;
        }
        
        setErrorMessage(errorMsg + ' You may need to retry these operations.');
      } else {
        setSuccessMessage('Service and all Cloudinary images updated successfully!');
      }
      
      // Navigate to service details after a short delay with cache-busting parameter
      setTimeout(() => {
        navigate(`/seller/services/${serviceId}?refresh=${Date.now()}`);
      }, hasErrors ? 3500 : 1500);
    } catch (error) {
      console.error('Error updating service images:', error);
      setErrorMessage('Service updated but failed to update some images.');
      // Still navigate to the service after a delay
      setTimeout(() => {
        navigate(`/seller/services/${serviceId}`);
      }, 2500);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price)
      };
      
      if (isEditMode && serviceIdToEdit) {
        // Update existing service
        updateServiceMutation.mutate({ 
          id: Number(serviceIdToEdit), 
          data: serviceData 
        });
      } else {
        // Create a new service
        createServiceMutation.mutate(serviceData);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(`Failed to ${isEditMode ? 'update' : 'create'} service. Please try again.`);
    }
  };

  const isSubmitting = createServiceMutation.isPending || updateServiceMutation.isPending || uploadingImages;
  const pageTitle = isEditMode ? 'Edit Service' : 'Create a New Service';

  // Show loading spinner while fetching service data for editing
  if (serviceIdToEdit && isLoadingService) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Error/Success Messages */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info & Price */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
                
                {/* Service Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-base border-gray-300 rounded-md p-3"
                      placeholder="e.g., Professional Logo Design"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Your title should be clear and catchy. (5-80 characters)
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-base border-gray-300 rounded-md p-3"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-base border-gray-300 rounded-md p-3"
                      placeholder="Describe your service in detail..."
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Clearly explain what your service includes and what makes it special.
                  </p>
                </div>

                {/* Price */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Pricing</h2>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-base">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-base border-gray-300 rounded-md p-3"
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-base">USD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Service Images</h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {imagePreviews.map((preview, index) => {
                        // Check if this is an existing image 
                        const isExistingImage = isEditMode && index < existingImages.length;
                        
                        return (
                          <div 
                            key={index} 
                            className={`relative aspect-square overflow-hidden rounded-md shadow-sm group ${isExistingImage ? 'ring-2 ring-primary-400' : ''}`}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                                Cover Image
                              </div>
                            )}
                            {isExistingImage && (
                              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs rounded-sm px-1">
                                Existing
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Image Button (if less than 5 images) */}
                      {imagePreviews.length < 5 && (
                        <div 
                          className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="mt-2 text-sm font-medium text-gray-700">Add Image</span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload up to 5 images (PNG, JPG, GIF). First image will be the cover image.
                    </p>
                  </div>
                </div>


              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner size="sm" />
                    <span className="ml-2">
                      {uploadingImages ? 'Uploading Images...' : 'Saving Service...'}
                    </span>
                  </div>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete Image Confirmation Modal */}
      {showDeleteModal && (
        <DeleteImageModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmImageDeletion}
        />
      )}
    </>
  );
};

export default SellerAddServicePage;
