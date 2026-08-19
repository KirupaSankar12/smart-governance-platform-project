import React, { useState, useEffect } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import { toast } from 'sonner';
import { Users, UserPlus, Trash2, CheckCircle2, AlertCircle, X, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function FamilyMembersModal({ isOpen, onClose, onSelectMember, selectedMemberId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const citizenId = keycloak?.tokenParsed?.sub;

  const [form, setForm] = useState({
    name: '',
    relationship: 'Child',
    dateOfBirth: '',
    gender: 'Male',
    aadhar: '',
    phoneNumber: ''
  });

  const loadFamilyMembers = () => {
    if (!citizenId) return;
    setLoading(true);
    api.get(`/api/citizens/family?citizenId=${citizenId}`)
      .then(res => setMembers(res.data))
      .catch(err => console.error('Error fetching family members:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadFamilyMembers();
      setShowAddForm(false);
      setError('');
    }
  }, [isOpen, citizenId]);

  if (!isOpen) return null;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      citizenId: citizenId,
      name: form.name.trim(),
      relationship: form.relationship,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
      aadhar: form.aadhar.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null
    };

    try {
      const res = await api.post('/api/citizens/family', payload);
      toast.success(`${form.name} added as ${form.relationship}`);
      setForm({ name: '', relationship: 'Child', dateOfBirth: '', gender: 'Male', aadhar: '', phoneNumber: '' });
      setShowAddForm(false);
      loadFamilyMembers();
      if (onSelectMember) {
        onSelectMember(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add family member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from your family profile?`)) return;
    try {
      await api.delete(`/api/citizens/family/${memberId}`);
      toast.success(`${memberName} removed.`);
      loadFamilyMembers();
    } catch (err) {
      toast.error('Failed to remove family member.');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 24, width: '100%', maxWidth: 560,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: 'rgba(37,99,235,0.2)',
              border: '1px solid #3b82f6', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                Family & Dependents Directory
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                Manage children, spouse, parents & dependents for joint applications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
              Saved Family Members ({members.length})
            </div>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '8px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff', border: 'none', fontWeight: 800, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
              >
                <UserPlus size={16} /> Add Family Member
              </button>
            )}
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Add Member Form */}
          {showAddForm && (
            <form onSubmit={handleAddMember} style={{ background: '#f8fafc', border: '1.5px solid #3b82f6', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                <HeartHandshake size={16} /> New Family Member Details
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                  Relationship <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Son', 'Daughter', 'Child', 'Spouse', 'Father', 'Mother', 'Other Dependent'].map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setForm({ ...form, relationship: rel })}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: form.relationship === rel ? '#3b82f6' : '#ffffff',
                        color: form.relationship === rel ? '#ffffff' : '#334155',
                        border: form.relationship === rel ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        transition: 'all 0.15s'
                      }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Arjun Kumar"
                  style={{ width: '100%', height: 44, paddingLeft: 14, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', background: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                    style={{ width: '100%', height: 44, paddingLeft: 12, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', background: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    style={{ width: '100%', height: 44, paddingLeft: 12, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', background: '#ffffff' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                    Aadhaar Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.aadhar}
                    onChange={e => setForm({ ...form, aadhar: e.target.value })}
                    placeholder="1234-5678-9012"
                    style={{ width: '100%', height: 44, paddingLeft: 12, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', background: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 4, textTransform: 'uppercase' }}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit family phone"
                    style={{ width: '100%', height: 44, paddingLeft: 12, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', background: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#16a34a', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  {submitting ? 'Saving...' : 'Save Dependent'}
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>Loading family members...</div>
          ) : members.length === 0 && !showAddForm ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: 16, border: '1px dashed #cbd5e1' }}>
              <Users size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 15, fontWeight: 800, color: '#334155' }}>No Family Members Added Yet</div>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 16 }}>
                Add your children, spouse, or parents so you can apply for birth/residence certificates or welfare schemes on their behalf.
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                style={{ padding: '8px 18px', borderRadius: 10, background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                + Add First Dependent
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {members.map(m => {
                const isSelected = selectedMemberId === m.memberId;
                return (
                  <div
                    key={m.memberId}
                    style={{
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{m.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: 12 }}>
                          {m.relationship}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 12 }}>
                            ✓ Selected Applicant
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', gap: 12 }}>
                        {m.dateOfBirth && <span>DOB: {m.dateOfBirth}</span>}
                        {m.aadhar && <span>Aadhaar: {m.aadhar}</span>}
                        {m.phoneNumber && <span>Phone: {m.phoneNumber}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {onSelectMember && (
                        <button
                          type="button"
                          onClick={() => onSelectMember(m)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                            background: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155',
                            border: isSelected ? 'none' : '1px solid #cbd5e1'
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m.memberId, m.name)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}
                        title="Remove dependent"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: 10, background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#334155', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
