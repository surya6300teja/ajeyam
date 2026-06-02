import { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.categories.getAllCategories();
      setCategories(res.data.data.categories || []);
    } catch (e) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', imageUrl: '', isActive: true });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name || '', description: cat.description || '', imageUrl: cat.imageUrl || '', isActive: !!cat.isActive });
    setImageFile(null);
    setImagePreview(cat.imageUrl || '');
    setIsModalOpen(true);
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      alert('Name and description are required.');
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('isActive', form.isActive);
      if (imageFile) {
        data.append('categoryImage', imageFile);
      } else if (form.imageUrl) {
        // Preserve the existing image when no new file is chosen
        data.append('imageUrl', form.imageUrl);
      }

      if (editing) {
        await api.categories.updateCategory(editing._id, data);
      } else {
        await api.categories.createCategory(data);
      }
      setIsModalOpen(false);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    await api.categories.deleteCategory(cat._id);
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin: Categories</h1>
        <button onClick={openCreate} className="btn btn-primary">New Category</button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2 text-gray-600">{cat.description || '-'}</td>
                  <td className="px-4 py-2">{cat.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">
                    <button className="btn btn-outline btn-xs mr-2" onClick={() => openEdit(cat)}>Edit</button>
                    <button className="btn btn-danger btn-xs" onClick={() => remove(cat)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-full h-40 object-cover rounded-lg mb-2 border border-gray-200"
                  />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={onPickImage}
                  className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary-dark"
                />
                <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF or WebP, up to 5MB. {editing && form.imageUrl ? 'Leave empty to keep the current image.' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="active">Active</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 