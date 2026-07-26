import { useState, useEffect, useRef } from 'react';
import { fetchProfile, saveProfile } from '../../utils/api';

export default function AdminProfile({ onNotify }) {
  const [form, setForm] = useState({
    name: '', title: '', punchline: '', about: '',
    email: '', phone: '', location: '',
  });
  const [croppedImageData, setCroppedImageData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile().then(p => {
      if (!p) return;
      setForm({
        name: p.name || '',
        title: p.title || '',
        punchline: p.punchline || '',
        about: p.about || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
      });
      if (p.image_path) setPreviewUrl(p.image_path);
    });
  }, []);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    // Try to use Cropper.js if available on CDN (loaded via admin.html)
    if (window.Cropper) {
      showCropModal(file);
    } else {
      // Fallback: direct preview
      const reader = new FileReader();
      reader.onload = ev => {
        setCroppedImageData(ev.target.result);
        setPreviewUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function showCropModal(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target.result;

      // Remove existing crop modal
      document.getElementById('cropModal')?.remove();

      const modal = document.createElement('div');
      modal.id = 'cropModal';
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.96);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
      modal.innerHTML = `
        <div style="background:var(--color-bg-card);padding:1.5rem;border-radius:1rem;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;border:1px solid rgba(0,212,255,0.2);">
          <h3 style="margin-bottom:0.5rem;color:var(--color-text-primary);display:flex;align-items:center;gap:0.5rem;">
            <i class="fas fa-crop-alt" style="color:var(--color-neon-blue);"></i> Crop Profile Photo
          </h3>
          <p style="color:var(--color-text-secondary);font-size:0.82rem;margin-bottom:1rem;">Drag to reposition • Scroll/pinch to zoom • Square crop applied automatically</p>
          <div style="width:100%;background:#0a0a0f;border-radius:0.5rem;overflow:hidden;margin-bottom:1rem;max-height:380px;">
            <img id="cropperImage" src="${src}" style="display:block;max-width:100%;">
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem;justify-content:center;">
            <button class="btn btn-outline" id="cropRotateLeft" type="button"><i class="fas fa-undo"></i> Rotate Left</button>
            <button class="btn btn-outline" id="cropRotateRight" type="button"><i class="fas fa-redo"></i> Rotate Right</button>
            <button class="btn btn-outline" id="cropZoomIn" type="button"><i class="fas fa-search-plus"></i> Zoom In</button>
            <button class="btn btn-outline" id="cropZoomOut" type="button"><i class="fas fa-search-minus"></i> Zoom Out</button>
            <button class="btn btn-outline" id="cropReset" type="button"><i class="fas fa-sync"></i> Reset</button>
          </div>
          <div style="display:flex;gap:1rem;justify-content:flex-end;">
            <button class="btn btn-outline" id="cropCancel" type="button">Cancel</button>
            <button class="btn btn-primary" id="cropDone" type="button"><i class="fas fa-check"></i> Use Cropped Image</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const image = document.getElementById('cropperImage');
      const cropper = new window.Cropper(image, {
        aspectRatio: 1, viewMode: 1, dragMode: 'move',
        autoCropArea: 0.85, guides: true, center: true, highlight: false,
      });

      document.getElementById('cropRotateLeft').onclick = () => cropper.rotate(-90);
      document.getElementById('cropRotateRight').onclick = () => cropper.rotate(90);
      document.getElementById('cropZoomIn').onclick = () => cropper.zoom(0.1);
      document.getElementById('cropZoomOut').onclick = () => cropper.zoom(-0.1);
      document.getElementById('cropReset').onclick = () => cropper.reset();
      document.getElementById('cropCancel').onclick = () => { cropper.destroy(); modal.remove(); };
      document.getElementById('cropDone').onclick = () => {
        const canvas = cropper.getCroppedCanvas({ width: 500, height: 500 });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCroppedImageData(dataUrl);
        setPreviewUrl(dataUrl);
        cropper.destroy();
        modal.remove();
      };
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    if (croppedImageData && croppedImageData.startsWith('data:image')) {
      const res = await fetch(croppedImageData);
      const blob = await res.blob();
      fd.append('profileImage', blob, 'profile.jpg');
    } else if (fileInputRef.current?.files[0]) {
      fd.append('profileImage', fileInputRef.current.files[0]);
    }

    try {
      const data = await saveProfile(fd);
      if (data.success) {
        onNotify('Profile updated successfully!');
      } else {
        onNotify('Failed to update profile.', 'error');
      }
    } catch {
      onNotify('Error saving profile.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="section-profile" className="admin-section active">
      <form id="profileForm" className="admin-form" onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profileName">Full Name</label>
            <input type="text" id="profileName" name="name" value={form.name} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="profileTitle">Professional Title</label>
            <input type="text" id="profileTitle" name="title" value={form.title} onChange={onChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="profilePunchline">Punchline</label>
          <input type="text" id="profilePunchline" name="punchline" value={form.punchline} onChange={onChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="profileAbout">About Me</label>
          <textarea id="profileAbout" name="about" rows={6} value={form.about} onChange={onChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profileEmail">Email</label>
            <input type="email" id="profileEmail" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="profilePhone">Phone</label>
            <input type="tel" id="profilePhone" name="phone" value={form.phone} onChange={onChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="profileLocation">Location</label>
          <input type="text" id="profileLocation" name="location" value={form.location} onChange={onChange} required />
        </div>

        <div className="form-group">
          <label>Profile Image</label>
          <input
            type="file"
            id="profileImageInput"
            accept="image/*"
            ref={fileInputRef}
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            id="profile-image-choose-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-upload" aria-hidden="true"></i> Choose Image
          </button>
          {previewUrl && (
            <div id="profileImagePreview" className="profile-image-preview" style={{ marginTop: '1rem' }}>
              <img src={previewUrl} alt="Profile preview" style={{ maxWidth: 200, borderRadius: '50%' }} />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" id="profile-save-btn" disabled={loading}>
          {loading ? (
            <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving...</>
          ) : (
            <><i className="fas fa-save" aria-hidden="true"></i> <span>Save Profile</span></>
          )}
        </button>
      </form>
    </section>
  );
}
