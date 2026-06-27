import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiSave, FiImage, FiX } from 'react-icons/fi';
import '../AddField/FieldForm.css';

const EditField = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', description: '', sizeValue: '', sizeUnit: 'acres',
    shape: 'rectangular', price: '', district: '', province: '',
    address: '', soilType: 'loamy', waterSource: 'rain_fed',
    currentCrop: 'Paddy', status: 'available'
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const res = await api.get(`/fields/${id}`);
        const field = res.data;
        setFormData({
          title: field.title,
          description: field.description,
          sizeValue: field.size.value,
          sizeUnit: field.size.unit,
          shape: field.shape,
          price: field.price,
          district: field.location.district,
          province: field.location.province,
          address: field.location.address,
          soilType: field.soilType,
          waterSource: field.waterSource,
          currentCrop: field.currentCrop,
          status: field.status
        });
        setExistingImages(field.images || []);
        setInitialLoading(false);
      } catch (error) {
        toast.error('Failed to load field details');
        navigate('/dashboard');
      }
    };
    fetchField();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 5) {
      toast.error('You can only have up to 5 images in total');
      return;
    }
    setNewImages([...newImages, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);

    const updatedPreviews = [...newImagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setNewImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        size: { value: Number(formData.sizeValue), unit: formData.sizeUnit },
        shape: formData.shape,
        price: Number(formData.price),
        location: { district: formData.district, province: formData.province, address: formData.address },
        soilType: formData.soilType,
        waterSource: formData.waterSource,
        currentCrop: formData.currentCrop,
        status: formData.status
      };

      const submitData = new FormData();
      submitData.append('fieldData', JSON.stringify(updateData));
      
      existingImages.forEach(img => {
        submitData.append('existingImages', img);
      });

      newImages.forEach(img => {
        submitData.append('images', img);
      });

      await api.put(`/fields/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Field updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update field');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading field data...</p></div>;
  }

  return (
    <div className="field-form-page">
      <div className="container">
        <div className="form-header animate-fade-in-up">
          <h1>Edit Field Listing</h1>
          <p>Update your paddy field details</p>
        </div>

        <div className="form-container animate-fade-in-up delay-1">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Listing Status</h3>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="status-select">
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Listing Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
              </div>
            </div>

            <div className="form-section">
              <h3>Field Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Size Value</label>
                  <input type="number" name="sizeValue" value={formData.sizeValue} onChange={handleChange} required step="0.01" />
                </div>
                <div className="form-group">
                  <label>Size Unit</label>
                  <select name="sizeUnit" value={formData.sizeUnit} onChange={handleChange}>
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="perches">Perches</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Shape</label>
                  <select name="shape" value={formData.shape} onChange={handleChange}>
                    <option value="rectangular">Rectangular</option>
                    <option value="square">Square</option>
                    <option value="irregular">Irregular</option>
                    <option value="l_shaped">L-Shaped</option>
                    <option value="triangular">Triangular</option>
                    <option value="circular">Circular</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (LKR)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Soil Type</label>
                  <select name="soilType" value={formData.soilType} onChange={handleChange}>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="silt">Silt</option>
                    <option value="peat">Peat</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Water Source</label>
                  <select name="waterSource" value={formData.waterSource} onChange={handleChange}>
                    <option value="river">River</option>
                    <option value="well">Well</option>
                    <option value="canal">Canal</option>
                    <option value="rain_fed">Rain Fed</option>
                    <option value="irrigation">Irrigation System</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Location</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Province</label>
                  <select name="province" value={formData.province} onChange={handleChange} required>
                    <option value="">Select Province</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Address / Nearest Town</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-section">
              <h3>Images (Max 5)</h3>
              <div className="image-upload-area">
                <input type="file" id="images" multiple accept="image/*" onChange={handleImageChange} className="file-input" />
                <label htmlFor="images" className="upload-btn">
                  <FiImage /> Choose Images
                </label>
                <p className="upload-hint">Upload high-quality photos of your field.</p>
              </div>
              
              <div className="image-previews">
                {/* Existing Images */}
                {existingImages.map((imgUrl, idx) => (
                  <div key={`exist-${idx}`} className="preview-container">
                    <img src={`http://localhost:5000${imgUrl}`} alt={`Existing ${idx}`} />
                    <button type="button" className="remove-img-btn" onClick={() => removeExistingImage(idx)}>
                      <FiX />
                    </button>
                  </div>
                ))}
                
                {/* New Image Previews */}
                {newImagePreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="preview-container">
                    <img src={preview} alt={`Preview ${idx}`} />
                    <button type="button" className="remove-img-btn" onClick={() => removeNewImage(idx)}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Updating...' : <><FiSave /> Update Listing</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditField;
