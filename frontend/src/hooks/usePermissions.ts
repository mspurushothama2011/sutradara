'use client';

import { useState, useEffect } from 'react';
import { Capability, User } from '../../../shared/types/index';

const ALL_CAPABILITIES: Capability[] = [
  'products:view',
  'products:create_edit',
  'inventory:quick_update',
  'orders:manage',
  'marketing:manage',
  'finance:view',
  'staff:attendance_view',
  'staff:payroll_manage',
  'announcements:post',
  'audit:view',
];

export function usePermissions() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('sutradara_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserCaps = (): string[] => {
    if (!user) return [];
    if (user.role === 'ADMIN') return ALL_CAPABILITIES;
    return user.customPermissions || (user as any).capabilities || [];
  };

  const hasCapability = (capability: Capability): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return getUserCaps().includes(capability);
  };

  const hasAnyCapability = (capabilities: Capability[]): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const userCaps = getUserCaps();
    return capabilities.some((cap) => userCaps.includes(cap));
  };

  return {
    user,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    isStaff: user?.role === 'STAFF',
    capabilities: user?.role === 'ADMIN' ? ALL_CAPABILITIES : getUserCaps(),
    hasCapability,
    hasAnyCapability,
  };
}
