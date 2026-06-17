import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ImagePlus,
  X,
  Loader2,
  Tag,
  DollarSign,
  FileText,
  Layers,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Books', 'Electronics', 'Others'];

const AddProductPage = () => {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef();

  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Books',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  // Load existing product when editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        // Verify ownership
        if (data.sellerId?._id !== user._id && data.sellerId !== user._id) {
          toast.error('Not authorized');
          navigate('/');
          return;
        }
        setForm({
          title: data.title,
          price: data.price,
          description: data.description,
          category: data.category,
        });
        setImagePreview(data.image || '');
      } catch {
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEditing, navigate, user._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.description || !form.category) {
      toast.error('Please fill all required fields');
      return;
    }
    if (parseFloat(form.price) < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update: only send text fields (image change not supported in edit)
        await api.put(`/products/${id}`, {
          title: form.title,
          price: parseFloat(form.price),
          description: form.description,
          category: form.category,
        });
        toast.success('Listing updated!');
        navigate(`/product/${id}`);
      } else {
        // Create: use multipart form
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('price', form.price);
        formData.append('description', form.description);
        formData.append('category', form.category);
        if (imageFile) formData.append('image', imageFile);

        const { data } = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Listing created!');
        navigate(`/product/${data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {isEditing ? 'Edit Listing' : 'List an Item'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload (only on create) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Image
              </label>
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[16/9]">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <ImagePlus size={22} className="text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload image
                  </span>
                  <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB</span>
                </button>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. NCERT Physics Part 1"
                maxLength={100}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.category === cat
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                  }`}
                >
                  {form.category === cat && <CheckCircle size={13} />}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item's condition, editions, accessories included, reason for selling…"
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/1000</p>
          </div>

          {/* College notice */}
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3">
            <Layers size={14} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              This listing will be visible to students at <strong>{user?.college}</strong> only.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              isEditing ? 'Save Changes' : 'Publish Listing'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
