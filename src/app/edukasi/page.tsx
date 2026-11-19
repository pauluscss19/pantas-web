'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { EDUCATION_ARTICLES } from '@/lib/education/content';

export default function EdukasiPage() {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'diabetes' | 'hipertensi' | 'umum'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = EDUCATION_ARTICLES.filter((art) => {
    const matchCategory = activeCategory === 'semua' || art.category === activeCategory;
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-pantas-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-pantas-primary tracking-tight">
          Pusat Edukasi Kesehatan Masyarakat
        </h1>
        <p className="text-sm text-pantas-muted mt-1 leading-relaxed">
          Materi edukasi disusun berdasarkan pedoman resmi Kementerian Kesehatan RI, Konsensus PERKENI, dan PERHI untuk membantu pencegahan serta pengendalian diabetes dan hipertensi secara mandiri.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-pantas-border overflow-x-auto">
          {[
            { id: 'semua', label: 'Semua Materi' },
            { id: 'diabetes', label: 'Diabetes Melitus' },
            { id: 'hipertensi', label: 'Hipertensi' },
            { id: 'umum', label: 'Gaya Hidup & Diet' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as 'semua' | 'diabetes' | 'hipertensi' | 'umum')}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-pantas-primary text-white'
                  : 'text-pantas-muted hover:text-pantas-dark'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-pantas-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik bacaan..."
            className="w-full pl-9 pr-3 py-2 border border-pantas-border rounded text-xs text-pantas-dark bg-white focus:border-pantas-primary"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              href={`/edukasi/${article.id}`}
              className="p-5 bg-white border border-pantas-border rounded-lg hover:border-pantas-primary hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-pantas-soft text-pantas-primary">
                    {article.category === 'umum' ? 'Gaya Hidup' : article.category}
                  </span>
                  <span className="text-[11px] text-pantas-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTimeMinutes} menit baca
                  </span>
                </div>

                <h2 className="text-base font-bold text-pantas-dark group-hover:text-pantas-primary transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs sm:text-sm text-pantas-muted leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-pantas-border/60 flex items-center justify-between text-xs font-semibold text-pantas-primary">
                <span>Baca panduan lengkap</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-pantas-border rounded-lg space-y-2">
          <BookOpen className="w-8 h-8 text-pantas-muted mx-auto" />
          <p className="font-semibold text-sm text-pantas-dark">Tidak ada materi yang sesuai</p>
          <p className="text-xs text-pantas-muted">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}

      {/* Official Source Footnote */}
      <div className="p-4 rounded-lg bg-neutral-100/70 border border-neutral-200 text-xs text-pantas-muted flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-pantas-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-pantas-dark">Standar Ilmiah & Akurasi Medis:</p>
          <p>
            Seluruh bacaan dirangkum dari pedoman resmi Kementerian Kesehatan Republik Indonesia, PERKENI (Perkumpulan Endokrinologi Indonesia), dan PERHI (Perhimpunan Dokter Hipertensi Indonesia). Disusun tanpa menggunakan klaim pemasaran atau mitos kesehatan yang tidak terverifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}

