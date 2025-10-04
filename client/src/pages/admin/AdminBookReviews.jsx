import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminBookReviews = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [published, setPublished] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', bookAuthor: '', rating: 5, summary: '', review: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pendingRes, publishedRes, statsRes] = await Promise.all([
          api.bookReviews.getPending(),
          api.bookReviews.getAll({ status: 'published' }),
          api.bookReviews.getStats(),
        ]);
        setPending(pendingRes.data.data.reviews || []);
        setPublished(publishedRes.data.data.reviews || []);
        setStats(statsRes.data.data);
      } catch (err) {
        setError('Failed to load book reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleApprove = async (id) => {
    await api.bookReviews.approve(id);
    setPending(pending.filter(r => r._id !== id));
    // Optionally refetch published
  };
  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (optional):');
    await api.bookReviews.reject(id, reason);
    setPending(pending.filter(r => r._id !== id));
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.bookReviews.delete(id);
    setPublished(published.filter(r => r._id !== id));
  };

  const openEdit = (review) => {
    setEditing(review);
    setEditForm({
      title: review.title || '',
      bookAuthor: review.bookAuthor || '',
      rating: review.rating || 5,
      summary: review.summary || '',
      review: review.review || '',
    });
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing?._id) return;
    setSaving(true);
    try {
      await api.bookReviews.update(editing._id, editForm);
      // Update local lists
      setPending(p => p.map(r => r._id === editing._id ? { ...r, ...editForm } : r));
      setPublished(p => p.map(r => r._id === editing._id ? { ...r, ...editForm } : r));
      setIsEditOpen(false);
      setEditing(null);
    } catch (e) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin: Book Reviews</h1>
      {stats && (
        <div className="mb-6 flex gap-8">
          <div>Total Reviews: <b>{stats.totalReviews}</b></div>
          <div>Pending: <b>{stats.pendingReviews}</b></div>
          <div>Published: <b>{stats.publishedReviews}</b></div>
          <div>Avg Rating: <b>{stats.avgRating?.toFixed(2)}</b></div>
        </div>
      )}
      <div className="mb-6 flex gap-4">
        <button className={`btn ${activeTab==='pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('pending')}>Pending Reviews</button>
        <button className={`btn ${activeTab==='published' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('published')}>Published Reviews</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : activeTab === 'pending' ? (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Book</th>
              <th className="px-4 py-2">Reviewer</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(r => (
              <tr key={r._id}>
                <td className="px-4 py-2">{r.title}</td>
                <td className="px-4 py-2">{r.bookAuthor}</td>
                <td className="px-4 py-2">{r.reviewer?.name || 'Anonymous'}</td>
                <td className="px-4 py-2">{'★'.repeat(r.rating)}</td>
                <td className="px-4 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button className="btn btn-success btn-xs mr-2" onClick={() => handleApprove(r._id)}>Approve</button>
                  <button className="btn btn-warning btn-xs mr-2" onClick={() => handleReject(r._id)}>Reject</button>
                  <button className="btn btn-outline btn-xs" onClick={() => openEdit(r)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Book</th>
              <th className="px-4 py-2">Reviewer</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {published.map(r => (
              <tr key={r._id}>
                <td className="px-4 py-2">{r.title}</td>
                <td className="px-4 py-2">{r.bookAuthor}</td>
                <td className="px-4 py-2">{r.reviewer?.name || 'Anonymous'}</td>
                <td className="px-4 py-2">{'★'.repeat(r.rating)}</td>
                <td className="px-4 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button className="btn btn-outline btn-xs mr-2" onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-danger btn-xs" onClick={() => handleDelete(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Review</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Author</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={editForm.bookAuthor} onChange={e => setEditForm({ ...editForm, bookAuthor: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={editForm.rating} onChange={e => setEditForm({ ...editForm, rating: Number(e.target.value) })}>
                  {[5,4,3,2,1].map(star => (
                    <option key={star} value={star}>{star} Star{star>1?'s':''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={editForm.summary} onChange={e => setEditForm({ ...editForm, summary: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={5} value={editForm.review} onChange={e => setEditForm({ ...editForm, review: e.target.value })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveEdit}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookReviews; 