'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/api';
import { AttendanceRecord } from '@/shared/types/index';

export default function StaffHRPage() {
  const { hasCapability, user } = usePermissions();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);

  // Salary Calculator State
  const [calcParams, setCalcParams] = useState({
    baseSalary: 35000,
    monthDays: 30,
    presentDays: 26,
    halfDays: 2,
    unpaidLeaves: 2,
    bonus: 2000,
  });
  const [salaryResult, setSalaryResult] = useState<any>(null);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/staff/attendance');
      setAttendance(res.attendance || []);
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = (res.attendance || []).find((a: AttendanceRecord) => a.date === today && !a.clockOut);
      setIsClockedIn(Boolean(todayRecord));
    } catch (e) {
      console.error('Failed to load attendance:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await apiRequest('/staff/payroll/calculate', {
        method: 'POST',
        data: calcParams,
      });
      setSalaryResult(res);
    } catch (e: any) {
      alert(e.message || 'Payroll calculation failed');
    }
  };

  useEffect(() => {
    loadAttendance();
    if (hasCapability('staff:payroll_manage')) {
      handleCalculate();
    }
  }, []);

  const handlePunch = async () => {
    try {
      if (isClockedIn) {
        await apiRequest('/staff/attendance/clock-out', { method: 'POST' });
        alert('✓ Clock-out recorded successfully.');
      } else {
        await apiRequest('/staff/attendance/clock-in', { method: 'POST' });
        alert('✓ Clock-in recorded successfully. Shift active.');
      }
      loadAttendance();
    } catch (e: any) {
      alert(e.message || 'Clock action failed');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
            WORKFORCE & HR
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
            Staff Attendance & Payroll
          </h1>
        </div>

        {/* Punch Clock Button */}
        <button
          onClick={handlePunch}
          style={{
            padding: '12px 24px',
            background: isClockedIn ? 'rgba(220, 38, 38, 0.1)' : 'rgba(34, 197, 94, 0.12)',
            border: isClockedIn ? '1px solid #dc2626' : '1px solid #16a34a',
            color: isClockedIn ? '#dc2626' : '#15803d',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(26, 19, 13, 0.04)',
          }}
        >
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isClockedIn ? '#dc2626' : '#16a34a' }} />
          {isClockedIn ? 'Punch Out (End Shift)' : 'Punch In (Start Shift)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: hasCapability('staff:payroll_manage') ? 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))' : '1fr', gap: '32px', alignItems: 'start' }}>
        {/* Attendance Log Table */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.22)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '16px' }}>
            Recent Attendance Punches
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', color: 'var(--text)', fontWeight: 700 }}>
                <th style={{ padding: '12px 10px' }}>Staff Member</th>
                <th style={{ padding: '12px 10px' }}>Date</th>
                <th style={{ padding: '12px 10px' }}>Clock In</th>
                <th style={{ padding: '12px 10px' }}>Clock Out</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(179, 137, 56, 0.12)' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--text)', fontWeight: 700 }}>{a.userName}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{a.date}</td>
                  <td style={{ padding: '12px 10px', color: '#15803d', fontWeight: 600 }}>
                    {new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 10px', color: a.clockOut ? '#dc2626' : 'var(--text-dim)', fontWeight: 600 }}>
                    {a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.12)', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Monthly Salary Formula Calculator (Restricted to Admin / Payroll Manager) */}
        {hasCapability('staff:payroll_manage') && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.4rem' }}>🧮</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)' }}>
                  Salary Calculator Formula 👑
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>
                  (Base ÷ Days) × (Present + 0.5×HalfDays) + Bonus
                </p>
              </div>
            </div>

            <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={calcParams.baseSalary}
                    onChange={(e) => setCalcParams({ ...calcParams, baseSalary: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Month Days</label>
                  <input
                    type="number"
                    value={calcParams.monthDays}
                    onChange={(e) => setCalcParams({ ...calcParams, monthDays: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Present Days</label>
                  <input
                    type="number"
                    value={calcParams.presentDays}
                    onChange={(e) => setCalcParams({ ...calcParams, presentDays: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Half Days</label>
                  <input
                    type="number"
                    value={calcParams.halfDays}
                    onChange={(e) => setCalcParams({ ...calcParams, halfDays: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Bonus (₹)</label>
                  <input
                    type="number"
                    value={calcParams.bonus}
                    onChange={(e) => setCalcParams({ ...calcParams, bonus: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(179, 137, 56, 0.35)',
                }}
              >
                Compute Salary
              </button>
            </form>

            {/* Calculated Breakdown Card */}
            {salaryResult && (
              <div
                style={{
                  marginTop: '16px',
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  <span>Daily Pro-rata Rate:</span>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{salaryResult.dailyRate}/day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  <span>Payable Units:</span>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{salaryResult.payableDays} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  <span>Earned Base + Bonus:</span>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{salaryResult.earnedBase} + ₹{salaryResult.bonus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid rgba(179,137,56,0.18)', color: '#15803d' }}>
                  <span>Net Payable Salary:</span>
                  <span>₹{salaryResult.netSalary?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
