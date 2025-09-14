import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "", // Now optional
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [image, setImage] = useState(null); // Now optional
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingProduct, setGeneratingProduct] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    
    // Clear specific field error when user starts typing again
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setAiGeneratedImage(null); // Clear AI generated image when user uploads a file
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Validate image
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Please select a valid image file (JPEG or PNG)"
        });
      } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors({
          ...errors,
          image: "Image size should be less than 5MB"
        });
      } else {
        setErrors({
          ...errors,
          image: null
        });
      }
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.brand.trim()) newErrors.brand = "Brand is required";
    
    // Description is optional - no validation needed
    
    // Price validation
    if (!product.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(product.price) <= 0) {
      newErrors.price = "Price must be greater than zero";
    }
    
    // Category validation
    if (!product.category) newErrors.category = "Please select a category";
    
    // Stock validation
    if (!product.stockQuantity) {
      newErrors.stockQuantity = "Stock quantity is required";
    } else if (parseInt(product.stockQuantity) < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }
    
    // Release date validation
    if (!product.releaseDate) newErrors.releaseDate = "Release date is required";
    
    // Image validation - check both uploaded file and AI generated image
    if (image) {
      // Only validate uploaded file properties
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(image.type)) {
        newErrors.image = "Please select a valid image file (JPEG or PNG)";
      } else if (image.size > 5 * 1024 * 1024) {
        newErrors.image = "Image size should be less than 5MB";
      }
    }
    // AI generated images are always valid (created by our system)
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateDescription = async () => {
    if (!product.name.trim() || !product.category) {
      toast.warning("Please enter product name and select a category first");
      return;
    }

    setGeneratingDescription(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/product/generate-description`,
        null,
        {
          params: {
            name: product.name,
            category: product.category
          }
        }
      );

      if (response.data) {
        setProduct({
          ...product,
          description: response.data
        });
        toast.success("Description generated successfully!");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data}`);
      } else {
        toast.error("Failed to generate description. Please try again.");
      }
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateImage = async () => {
    if (!product.name.trim() || !product.category || !product.description.trim()) {
      toast.warning("Please enter product name, category, and description first");
      return;
    }

    setGeneratingImage(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/product/generate-image`,
        null,
        {
          params: {
            name: product.name,
            category: product.category,
            description: product.description
          },
          responseType: 'arraybuffer' // Important for handling byte array response
        }
      );

      if (response.data) {
        // Convert byte array to blob and create URL
        const blob = new Blob([response.data], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        
        // Set AI generated image
        setAiGeneratedImage({
          blob: blob,
          url: imageUrl
        });
        setImagePreview(imageUrl);
        setImage(null); // Clear file input
        
        toast.success("Image generated successfully!");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      if (error.response && error.response.data) {
        // Convert arraybuffer error to string
        const errorMessage = new TextDecoder().decode(error.response.data);
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error("Failed to generate image. Please try again.");
      }
    } finally {
      setGeneratingImage(false);
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    
    // Bootstrap form validation
    const form = event.currentTarget;
    setValidated(true);
    
    // Custom validation
    if (!validateForm() || !form.checkValidity()) {
      event.stopPropagation();
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    
    // Handle image - prioritize uploaded file over AI generated
    if (image) {
      formData.append("imageFile", image);
    } else if (aiGeneratedImage) {
      // Convert AI generated image blob to file
      const file = new File([aiGeneratedImage.blob], "ai-generated-image.jpg", {
        type: "image/jpeg"
      });
      formData.append("imageFile", file);
    }
    // If neither image nor aiGeneratedImage exists, no image is appended (maintains original optional behavior)
    
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    axios
      .post(`${baseUrl}/api/product`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Product added successfully:", response.data);
        toast.success('Product added successfully');
        // Reset form state after successful submission
        setProduct({
          name: "",
          brand: "",
          description: "",
          price: "",
          category: "",
          stockQuantity: "",
          releaseDate: "",
          productAvailable: false,
        });
        setImage(null);
        setAiGeneratedImage(null);
        setImagePreview(null);
        setValidated(false);
        setErrors({});
        navigate('/');
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        if (error.response && error.response.data) {
          // Handle server validation errors
          setErrors(error.response.data);
        } else {
          toast.error('Error adding product')
        }
        setLoading(false); // Only set loading false on error, success navigates away
      });
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.warning("Please enter a product description");
      return;
    }
    
    setGeneratingProduct(true);
    
    try {
      const response = await axios.post(`${baseUrl}/api/product/generate-product?query=${encodeURIComponent(aiPrompt)}`);
      console.log(response, 'generated response');
      
      if (response.data) {
        const generatedProduct = response.data;
        // Set the generated product data to form
        setProduct({
          name: generatedProduct.name || "",
          brand: generatedProduct.brand || "",
          description: generatedProduct.description || "",
          price: generatedProduct.price || "",
          category: generatedProduct.category || "",
          stockQuantity: generatedProduct.stockQuantity || "",
          releaseDate: generatedProduct.releaseDate || "",
          productAvailable: generatedProduct.productAvailable || false,
        });
        toast.success('Product generated successfully!');
      }
      
      // Close the modal
      setShowModal(false);
      setAiPrompt("");
    } catch (error) {
      console.log(error);
      toast.error("Error generating product. Please try again.");
    } finally {
      setGeneratingProduct(false);
    }
  };

  // Check if AI generation features are available
  const canGenerateDescription = product.name.trim() && product.category;
  const canGenerateImage = product.name.trim() && product.category && product.description.trim();

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Add New Product</h2>
              
              <form className="row g-3 needs-validation" noValidate validated={validated.toString()} onSubmit={submitHandler}>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold">Name</label>
                  <input
                    type="text"
                    className={`form-control ${validated ? (errors.name ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="Product Name"
                    onChange={handleInputChange}
                    value={product.name}
                    name="name"
                    id="name"
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="brand" className="form-label fw-bold">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    className={`form-control ${validated ? (errors.brand ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="Enter your Brand"
                    value={product.brand}
                    onChange={handleInputChange}
                    id="brand"
                    required
                  />
                  {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
                </div>

                <div className="col-md-4">
                  <label htmlFor="category" className="form-label fw-bold">Category</label>
                  <select
                    className={`form-select ${validated ? (errors.category ? 'is-invalid' : 'is-valid') : ''}`}
                    value={product.category}
                    onChange={handleInputChange}
                    name="category"
                    id="category"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Headphone">Headphone</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Toys">Toys</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>
                
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label htmlFor="description" className="form-label fw-bold mb-0">
                      Description <span className="text-muted">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-primary ${!canGenerateDescription ? 'disabled' : ''}`}
                      onClick={generateDescription}
                      disabled={!canGenerateDescription || generatingDescription}
                      title={!canGenerateDescription ? "Please enter product name and select category first" : "Generate description with AI"}
                    >
                      {generatingDescription ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-robot me-1"></i>
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    className={`form-control ${validated && errors.description ? 'is-invalid' : ''}`}
                    placeholder="Add product description (optional) or use AI to generate one"
                    value={product.description}
                    name="description"
                    onChange={handleInputChange}
                    id="description"
                    rows="4"
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  {!canGenerateDescription && (
                    <div className="form-text text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Fill in product name and category to enable AI description generation
                    </div>
                  )}
                </div>
                
                <div className="col-md-4">
                  <label htmlFor="price" className="form-label fw-bold">Price</label>
                  <div className="input-group">
                    <span className="input-group-text">Rs</span>
                    <input
                      type="number"
                      className={`form-control ${validated ? (errors.price ? 'is-invalid' : 'is-valid') : ''}`}
                      placeholder="Enter price"
                      onChange={handleInputChange}
                      value={product.price}
                      name="price"
                      id="price"
                      min="0.01"
                      step="0.01"
                      required
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                </div>
             
            

                <div className="col-md-4">
                  <label htmlFor="stockQuantity" className="form-label fw-bold">Stock Quantity</label>
                  <input
                    type="number"
                    className={`form-control ${validated ? (errors.stockQuantity ? 'is-invalid' : 'is-valid') : ''}`}
                    placeholder="Stock Remaining"
                    onChange={handleInputChange}
                    value={product.stockQuantity}
                    name="stockQuantity"
                    id="stockQuantity"
                    min="0"
                    required
                  />
                  {errors.stockQuantity && <div className="invalid-feedback">{errors.stockQuantity}</div>}
                </div>
                
                <div className="col-md-4">
                  <label htmlFor="releaseDate" className="form-label fw-bold">Release Date</label>
                  <input
                    type="date"
                    className={`form-control ${validated ? (errors.releaseDate ? 'is-invalid' : 'is-valid') : ''}`}
                    value={product.releaseDate}
                    name="releaseDate"
                    onChange={handleInputChange}
                    id="releaseDate"
                    required
                  />
                  {errors.releaseDate && <div className="invalid-feedback">{errors.releaseDate}</div>}
                </div>
                
                <div className="col-md-8">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label htmlFor="imageFile" className="form-label fw-bold mb-0">
                      Image <span className="text-muted">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-success ${!canGenerateImage ? 'disabled' : ''}`}
                      onClick={generateImage}
                      disabled={!canGenerateImage || generatingImage}
                      title={!canGenerateImage ? "Please enter product name, category, and description first" : "Generate image with AI"}
                    >
                      {generatingImage ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-image me-1"></i>
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    className={`form-control ${validated && errors.image ? 'is-invalid' : ''}`}
                    type="file"
                    onChange={handleImageChange}
                    id="imageFile"
                    accept="image/png, image/jpeg"
                  />
                  {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                  <div className="form-text">Upload a product image (JPG, PNG) or generate one with AI</div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          {aiGeneratedImage ? "AI Generated Image Preview:" : "Selected Image Preview:"}
                        </small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setImagePreview(null);
                            setImage(null);
                            setAiGeneratedImage(null);
                            document.getElementById('imageFile').value = '';
                          }}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remove
                        </button>
                      </div>
                      <div className="border rounded p-2 bg-light">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="img-fluid rounded"
                          style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {!canGenerateImage && (
                    <div className="form-text text-muted mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      Fill in product name, category, and description to enable AI image generation
                    </div>
                  )}
                </div>
                
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="productAvailable"
                      id="productAvailable"
                      checked={product.productAvailable}
                      onChange={(e) =>
                        setProduct({ ...product, productAvailable: e.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="productAvailable">
                      Product Available
                    </label>
                  </div>
                </div>
                
                <div className="col-12 mt-4">
                  <div className="d-flex gap-2">                  
                    {loading ? (
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled
                      >
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-robot me-2"></i>
                  Generate Product with AI
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                  disabled={generatingProduct}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted">Describe the product you want to create, and our AI will generate product details for you.</p>
                <div className="mb-3">
                  <label htmlFor="aiPrompt" className="form-label">Product Description</label>
                  <textarea
                    id="aiPrompt"
                    className="form-control"
                    rows="4"
                    placeholder="E.g., A premium gaming laptop with high-end graphics card, 32GB RAM, and 1TB SSD storage"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={generatingProduct}
                  ></textarea>
                </div>
                <div className="form-text mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  The more detailed your description, the better the generated product will be.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={generatingProduct}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleGenerate}
                  disabled={generatingProduct || !aiPrompt.trim()}
                >
                  {generatingProduct ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lightning-fill me-1"></i>
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;