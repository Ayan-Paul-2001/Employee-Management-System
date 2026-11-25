'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api, getApiErrorMessage } from '@/lib/api';
import { AvatarCircle, RoleBadge } from '@/components/Badges';

export default function ProfileSecurityPage() {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Direct Change Password state (for HR, Admin, and Employee — no Nodemailer needed)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setDepartment(user.department || '');
      setPosition(user.position || '');
      setPhoneNumber(user.phoneNumber || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/users/profile', {
        fullName: fullName.trim(),
        department: department.trim(),
        position: position.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      setUser(res.data);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const differsFromCurrent =
    currentPassword.length > 0 && newPassword.length > 0 && newPassword !== currentPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!hasMinLength) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('New password must be different from your current password.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.post('/auth/profile/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update password'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="nh-card flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <AvatarCircle name={user.fullName} role={user.role} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-heading text-xl font-bold text-[#111318]">
                {user.fullName}
              </h2>
              <RoleBadge role={user.role} />
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#6B6E76]">
              <Mail className="h-3.5 w-3.5 text-[#9A7432]" />
              {user.email}
            </p>
            <p className="mt-0.5 font-mono text-xs text-[#8E919A]">
              ID: {user.employeeCode} • Joined{' '}
              {user.dateOfJoining
                ? new Date(user.dateOfJoining).toLocaleDateString()
                : 'Active'}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#B6E2D1] bg-[#ECF8F3] px-3.5 py-2 text-xs font-semibold text-[#0D6A4E]">
          <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
          Verified Account
        </div>
      </div>

      {/* 2-Column Profile & Security */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="nh-card p-6 lg:col-span-7">
          <div className="mb-5 border-b border-[#EFECE5] pb-4">
            <h3 className="font-heading text-base font-bold text-[#111318]">
              Personal Information
            </h3>
            <p className="mt-0.5 text-xs text-[#73767E]">
              Keep your directory profile and contact details current.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Full Name
              </label>
              <div className="nh-field-box">
                <UserIcon className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="nh-field-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Department
                </label>
                <div className="nh-field-box">
                  <Building2 className="h-4 w-4 shrink-0 text-[#8B8982]" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="nh-field-input"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                  Position / Title
                </label>
                <div className="nh-field-box">
                  <Briefcase className="h-4 w-4 shrink-0 text-[#8B8982]" />
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="nh-field-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Phone Number
              </label>
              <div className="nh-field-box">
                <Phone className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="nh-field-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Address
              </label>
              <div className="nh-field-box">
                <MapPin className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, City"
                  className="nh-field-input"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="nh-btn-primary px-5 py-2.5 text-xs"
              >
                <Save className="h-4 w-4 text-[#EAD3A1]" />
                {savingProfile ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Direct Change Password Card (Works for HR, Admin & Employee) */}
        <div className="nh-card p-6 lg:col-span-5">
          <div className="mb-5 border-b border-[#EFECE5] pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#9A7432]" />
              <h3 className="font-heading text-base font-bold text-[#111318]">
                Change Password
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#73767E]">
              Update your account password directly by verifying your current
              password.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Current Password
              </label>
              <div className="nh-field-box">
                <Lock className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="nh-field-input"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="shrink-0 text-[#8B8982] transition hover:text-[#111318]"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                New Password
              </label>
              <div className="nh-field-box">
                <KeyRound className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="nh-field-input"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="shrink-0 text-[#8B8982] transition hover:text-[#111318]"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C5F66]">
                Confirm New Password
              </label>
              <div className="nh-field-box">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#8B8982]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="nh-field-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="shrink-0 text-[#8B8982] transition hover:text-[#111318]"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Password Checklist */}
            <div className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F5] px-4 py-3 text-xs">
              <div className="space-y-1.5">
                <div
                  className={`flex items-center gap-2 ${
                    hasMinLength ? 'font-semibold text-[#0D6A4E]' : 'text-[#73767E]'
                  }`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 shrink-0 ${
                      hasMinLength ? 'text-[#0F766E]' : 'text-[#C7C2B5]'
                    }`}
                  />
                  <span>At least 8 characters long</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordsMatch
                      ? 'font-semibold text-[#0D6A4E]'
                      : 'text-[#73767E]'
                  }`}
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 shrink-0 ${
                      passwordsMatch ? 'text-[#0F766E]' : 'text-[#C7C2B5]'
                    }`}
                  />
                  <span>New password and confirmation match</span>
                </div>
                {currentPassword.length > 0 && newPassword.length > 0 && !differsFromCurrent && (
                  <p className="pt-0.5 text-[11px] font-medium text-[#BE123C]">
                    New password must differ from your current password.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="nh-btn-primary w-full py-3 text-xs"
            >
              <KeyRound className="h-4 w-4 text-[#EAD3A1]" />
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
