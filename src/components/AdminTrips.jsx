import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  { id: 'mountains', label: 'Mountains' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'honeymoon', label: 'Honeymoon' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'heritage', label: 'Heritage' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
];

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageWarning, setImageWarning] = useState('');
  const { showError, showSuccess, showWarning } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    state: '',
    price: '',
    duration: '',
    durationType: 'Nights',
    category: 'mountains',
    description: '',
    highlights: '',
    imageUrl: '',
    imageFile: null,
    itinerary: [{ day: 1, title: 'Day 1', description: '' }],
  });

  // Fetch trips in real-time
  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(tripsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Convert image file to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check file size and show warning
  const checkImageSize = (file) => {
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      const sizeDiff = formatFileSize(file.size - maxSize);
      showWarning(`Image size (${formatFileSize(file.size)}) exceeds the limit by ${sizeDiff}. Please compress your image to under 500KB.`);
      return false;
    }
    return true;
  };

  // Handle image upload (stores as Base64 in Firestore)
  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      // Convert to Base64
      const base64 = await convertToBase64(file);
      setUploading(false);
      return base64;
    } catch (err) {
      showError('Failed to process image');
      setUploading(false);
      return null;
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload image if new file selected
    let imageUrl = formData.imageUrl;
    if (formData.imageFile) {
      const uploadedUrl = await handleImageUpload(formData.imageFile);
      if (!uploadedUrl) return;
      imageUrl = uploadedUrl;
    }

    if (!imageUrl) {
      showError('Please add an image');
      return;
    }

    const tripData = {
      title: formData.title,
      location: formData.location,
      state: formData.state,
      price: parseInt(formData.price) || 0,
      duration: parseInt(formData.duration) || 0,
      durationType: formData.durationType,
      category: formData.category,
      description: formData.description,
      highlights: formData.highlights.split(',').map((h) => h.trim()).filter(Boolean),
      imageUrl,
      itinerary: formData.itinerary.filter((day) => day.title && day.description),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingTrip) {
        await updateDoc(doc(db, 'trips', editingTrip.id), tripData);
        showSuccess('Trip updated!');
      } else {
        await addDoc(collection(db, 'trips'), {
          ...tripData,
          createdAt: new Date().toISOString(),
        });
        showSuccess('Trip created!');
      }
      resetForm();
    } catch (err) {
      showError('Failed to save trip');
    }
  };

  // Delete trip
  const handleDelete = async (trip) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteDoc(doc(db, 'trips', trip.id));
      showSuccess('Trip deleted!');
    } catch (err) {
      showError('Failed to delete trip');
    }
  };

  // Edit trip
  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      ...trip,
      price: trip.price?.toString() || '',
      duration: trip.duration?.toString() || '',
      highlights: trip.highlights?.join(', ') || '',
      imageFile: null,
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      state: '',
      price: '',
      duration: '',
      durationType: 'Nights',
      category: 'mountains',
      description: '',
      highlights: '',
      imageUrl: '',
      imageFile: null,
      itinerary: [{ day: 1, title: 'Day 1', description: '' }],
    });
    setEditingTrip(null);
    setShowForm(false);
  };

  // Add itinerary day
  const addItineraryDay = () => {
    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        { day: formData.itinerary.length + 1, title: `Day ${formData.itinerary.length + 1}`, description: '' },
      ],
    });
  };

  // Update itinerary
  const updateItinerary = (index, field, value) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index][field] = value;
    setFormData({ ...formData, itinerary: newItinerary });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Trips</h2>
          <p className="text-white/70">Create, edit, and delete trip packages</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF9933] text-[#000080] font-semibold hover:bg-[#ffaa44] transition"
        >
          + Add New Trip
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#000080] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTrip ? 'Edit Trip' : 'Create New Trip'}
              </h3>
              <button
                onClick={resetForm}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Trip Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Kashmir Paradise Tour"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  required
                />
              </div>

              {/* Location & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Munnar"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    required
                  >
                    <option value="" className="text-gray-800">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state} className="text-gray-800">{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="15999"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Duration</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="4"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Type</label>
                  <select
                    value={formData.durationType}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  >
                    <option value="Days" className="text-gray-800">Days</option>
                    <option value="Nights" className="text-gray-800">Nights</option>
                    <option value="Hours" className="text-gray-800">Hours</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.category === cat.id
                          ? 'bg-[#FF9933] text-[#000080]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the trip experience..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  required
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Highlights (comma separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Houseboat stay, Trekking, Campfire"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Trip Image {editingTrip && '(leave empty to keep current)'} <span className="text-white/50">(Max: 500KB)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (!checkImageSize(file)) {
                        e.target.value = '';
                        setFormData({ ...formData, imageFile: null });
                        return;
                      }
                      setFormData({ ...formData, imageFile: file });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF9933] file:text-[#000080] hover:file:bg-[#ffaa44]"
                />
                {/* Show selected file info */}
                {formData.imageFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓ Selected:</span>
                    <span className="text-white/80">{formData.imageFile.name}</span>
                    <span className="text-white/50">({formatFileSize(formData.imageFile.size)})</span>
                  </div>
                )}
                {(formData.imageUrl || editingTrip?.imageUrl) && (
                  <img
                    src={formData.imageUrl || editingTrip?.imageUrl}
                    alt="Preview"
                    className="mt-3 h-32 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* Itinerary */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Itinerary</label>
                {formData.itinerary.map((day, index) => (
                  <div key={index} className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/70 text-sm">Day {day.day}</span>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateItinerary(index, 'title', e.target.value)}
                        placeholder="Day title"
                        className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                      />
                    </div>
                    <textarea
                      value={day.description}
                      onChange={(e) => updateItinerary(index, 'description', e.target.value)}
                      placeholder="What you'll do this day..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItineraryDay}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm"
                >
                  + Add Day
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 rounded-xl bg-[#FF9933] text-[#000080] font-semibold hover:bg-[#ffaa44] transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : editingTrip ? 'Update Trip' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trips List */}
      {loading ? (
        <div className="text-white text-center py-12">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">No Trips Yet</h3>
          <p className="text-white/70 mb-6">Create your first trip package to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl bg-[#FF9933] text-[#000080] font-semibold hover:bg-[#ffaa44] transition"
          >
            Create First Trip
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white/10 rounded-xl p-4 border border-white/20"
            >
              <div className="flex gap-4">
                <img
                  src={trip.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200'}
                  alt={trip.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{trip.title}</h4>
                  <p className="text-white/70 text-sm">{trip.location}, {trip.state}</p>
                  <p className="text-[#FF9933] font-bold">₹{trip.price?.toLocaleString('en-IN')}</p>
                  <p className="text-white/50 text-xs">{trip.duration} {trip.durationType}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(trip)}
                  className="flex-1 py-2 rounded-lg bg-[#FF9933]/20 text-[#FF9933] hover:bg-[#FF9933]/30 text-sm font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(trip)}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
