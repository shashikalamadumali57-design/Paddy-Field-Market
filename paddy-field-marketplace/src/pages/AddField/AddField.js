import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiSave, FiImage, FiX } from 'react-icons/fi';
import './FieldForm.css'; // We'll use a shared CSS file for Add and Edit

const AddField = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sizeValue: '',
    sizeUnit: 'acres',
    shape: 'rectangular',
    price: '',
    district: '',
    province: '',
    address: '',
    soilType: 'loamy',
    waterSource: 'rain_fed',
    currentCrop: 'Paddy',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }
    setImages([...images, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fieldData = {
        title: formData.title,
        description: formData.description,
        size: {
          value: Number(formData.sizeValue),
          unit: formData.sizeUnit
        },
        shape: formData.shape,
        price: Number(formData.price),
        location: {
          district: formData.district,
          province: formData.province,
          address: formData.address
        },
        soilType: formData.soilType,
        waterSource: formData.waterSource,
        currentCrop: formData.currentCrop
      };

      const submitData = new FormData();
      submitData.append('fieldData', JSON.stringify(fieldData));
      
      images.forEach(img => {
        submitData.append('images', img);
      });

      await api.post('/fields', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Field listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add field');
    }
    setLoading(false);
  };

  return (
    <div className="field-form-page">
      <div className="container">
        <div className="form-header animate-fade-in-up">
          <h1>Add New Field Listing</h1>
          <p>Provide details about your paddy field to attract buyers</p>
        </div>

        <div className="form-container animate-fade-in-up delay-1">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Listing Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. 5 Acre Prime Paddy Field in Anuradhapura" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="Describe the field, its history, surroundings, etc."></textarea>
              </div>
            </div>

            <div className="form-section">
              <h3>Field Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Size Value</label>
                  <input type="number" name="sizeValue" value={formData.sizeValue} onChange={handleChange} required placeholder="e.g. 5" step="0.01" />
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
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="Total price" />
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
                  <input type="text" name="district" value={formData.district} onChange={handleChange} required placeholder="e.g. Anuradhapura" />
                </div>
              </div>
              <div className="form-group">
                <label>Address / Nearest Town</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="e.g. 123 Farming Village, Eppawala" />
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
              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="preview-container">
                      <img src={preview} alt={`Preview ${idx}`} />
                      <button type="button" className="remove-img-btn" onClick={() => removeImage(idx)}>
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving...' : <><FiSave /> Save Listing</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddField;
