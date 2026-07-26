import { useState, useEffect } from 'react';
import { fetchMessages, deleteMessage } from '../../utils/api';
import ConfirmModal from '../ConfirmModal';

function formatDate(d) {
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return d || ''; }
}

export default function AdminMessages({ onNotify, onMessageCountChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMessages();
      setMessages(data || []);
      onMessageCountChange?.(data?.length || 0);
    } catch { } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function confirmDelete(msg) {
    setConfirm({
      title: 'Delete Message',
      message: `Delete message from "${msg.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await deleteMessage(msg.id);
          if (res.success) {
            onNotify('Message deleted!');
            await load();
          } else {
            onNotify('Failed to delete.', 'error');
          }
        } catch { onNotify('Error deleting message.', 'error'); }
      },
    });
  }

  return (
    <section id="section-messages" className="admin-section active">
      <div className="section-header-admin">
        <h2>Contact Messages</h2>
        <span style={{
          background: 'rgba(0,212,255,0.1)', color: 'var(--color-neon-blue)',
          borderRadius: '1rem', padding: '0.25rem 1rem', fontSize: '0.875rem',
        }}>
          {messages.length} total
        </span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading messages...</p>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-secondary)' }}>
          <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', color: 'var(--color-neon-blue)', opacity: 0.4 }} aria-hidden="true"></i>
          <p>No messages yet.</p>
        </div>
      ) : (
        <div id="messagesList" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map(msg => (
            <div key={msg.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              {/* Header row */}
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--color-neon-blue), var(--color-neon-purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-user" style={{ color: '#fff', fontSize: '1rem' }} aria-hidden="true"></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{msg.name}</strong>
                    <a href={`mailto:${msg.email}`} style={{ color: 'var(--color-neon-blue)', fontSize: '0.85rem' }}>
                      <i className="fas fa-envelope" aria-hidden="true" style={{ marginRight: 4 }}></i>{msg.email}
                    </a>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: '0.2rem' }}>
                    <i className="fas fa-clock" aria-hidden="true" style={{ marginRight: 4 }}></i>{formatDate(msg.created_at)}
                  </div>
                </div>
                <div className="item-actions" style={{ flexShrink: 0 }}>
                  <button
                    className="btn-icon"
                    id={`expand-msg-${msg.id}`}
                    title={expandedId === msg.id ? 'Collapse' : 'View'}
                    onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                  >
                    <i className={`fas ${expandedId === msg.id ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>
                  </button>
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || '')}`}
                    className="btn-icon"
                    id={`reply-msg-${msg.id}`}
                    title="Reply via email"
                    aria-label="Reply"
                  >
                    <i className="fas fa-reply" aria-hidden="true"></i>
                  </a>
                  <button
                    className="btn-icon btn-danger"
                    id={`delete-msg-${msg.id}`}
                    title="Delete"
                    onClick={() => confirmDelete(msg)}
                  >
                    <i className="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>

              {/* Subject */}
              {msg.subject && (
                <div style={{
                  background: 'rgba(0,212,255,0.06)', borderRadius: '0.4rem',
                  padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: '100%',
                  color: 'var(--color-text-secondary)',
                }}>
                  <i className="fas fa-tag" style={{ marginRight: 6, color: 'var(--color-neon-blue)' }} aria-hidden="true"></i>
                  {msg.subject}
                </div>
              )}

              {/* Expanded body */}
              {expandedId === msg.id && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem',
                  padding: '1rem', width: '100%', fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)', lineHeight: 1.7,
                  borderLeft: '3px solid var(--color-neon-blue)',
                }}>
                  {msg.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          type="danger"
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </section>
  );
}
