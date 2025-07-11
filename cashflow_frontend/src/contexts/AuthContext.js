import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);

  const fetchSummaryData = useCallback(async () => {
    // Pastikan hanya fetch jika ada token
    if (!localStorage.getItem('token')) return;

    try {
        const res = await api.get('/dashboard/summary');
        setSummaryData(res.data);
    } catch (error) {
        console.error("Gagal memuat data summary", error);
        setSummaryData(null); // Set null jika gagal
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        
        // Cek apakah token sudah kadaluwarsa
        if (decodedUser.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setUser(null);
        } else {
            setUser(decodedUser.user);
            fetchSummaryData(); // Ambil data summary jika token valid
        }
      } catch (error) {
        // Jika token tidak valid/rusak
        localStorage.removeItem('token');
        setUser(null);
        console.error("Token tidak valid:", error);
      }
    }
    // Pastikan loading selalu false setelah semua pengecekan selesai
    setAuthLoading(false);
  }, [fetchSummaryData]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    const decodedUser = jwtDecode(response.data.token);
    setUser(decodedUser.user);
    await fetchSummaryData(); // Ambil data summary setelah login
  };

  const register = async (fullName, email, password) => {
    await api.post('/auth/register', { full_name: fullName, email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSummaryData(null); // Hapus juga data summary saat logout
  };

  // Gabungkan semua state dan fungsi yang akan di-provide
  const value = { 
    user, 
    login, 
    register, 
    logout, 
    isAuthenticated: !!user, 
    authLoading, 
    summaryData, 
    fetchSummaryData 
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Tampilkan aplikasi HANYA jika proses loading autentikasi awal sudah selesai */}
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;