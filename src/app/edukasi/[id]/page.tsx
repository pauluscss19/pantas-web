'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { EDUCATION_ARTICLES } from '@/lib/education/content';

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const article = EDUCATION_ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="p-8 text-center bg-white border border-pantas-border rounded-lg space-y-3">
        <h2 className="text-base font-bold text-pantas-dark">Artikel Tidak Ditemukan</h2>
        <p className="text-xs text-pantas-muted">Materi edukasi yang Anda cari tidak tersedia.</p>
        <div className="pt-2">
          <Link
            href="/edukasi"
            className="inline-flex items-center gap-1 px-4 py-2 bg-pantas-primary text-white rounded text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Pusat Edukasi</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/edukasi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pantas-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pusat Edukasi</span>
        </Link>
      </div>

      {/* Article Header Card */}
      <div className="p-6 bg-white border border-pantas-border rounded-lg shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-pantas-soft text-pantas-primary">
            {article.category === 'umum' ? 'Gaya Hidup & Diet' : article.category}
          </span>
          <span className="text-xs text-pantas-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readTimeMinutes} menit baca
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-pantas-dark leading-tight tracking-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-pantas-muted leading-relaxed border-l-4 border-pantas-primary pl-3.5 italic bg-pantas-bg/60 py-2 rounded-r">
          {article.summary}
        </p>
      </div>

      {/* Article Sections */}
      <div className="p-6 sm:p-8 bg-white border border-pantas-border rounded-lg shadow-sm space-y-6 text-pantas-dark text-base leading-relaxed">
        {article.sections.map((sec, idx) => (
          <section key={idx} className="space-y-3">
            {sec.heading && (
              <h2 className="text-lg sm:text-xl font-bold text-pantas-primary tracking-tight border-b border-pantas-border/60 pb-1.5">
                {sec.heading}
              </h2>
            )}

            {sec.content.map((p, pIdx) => (
              <p key={pIdx} className="text-sm sm:text-base text-neutral-800 leading-relaxed">
                {p}
              </p>
            ))}

            {sec.tips && sec.tips.length > 0 && (
              <div className="p-4 rounded-lg bg-pantas-soft/50 border border-pantas-border space-y-2 mt-3">
                <p className="text-xs font-bold text-pantas-primary uppercase tracking-wider">
                  Poin Praktis Sehari-hari:
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-800">
                  {sec.tips.map((tip, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pantas-primary mt-2 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Official Sources Citation & Review Date */}
      <div className="p-5 bg-white border border-pantas-border rounded-lg space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-pantas-dark uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-pantas-primary" />
          <span>Sumber Resmi & Peninjauan Materi</span>
        </div>
        <div className="divide-y divide-pantas-border/50 text-xs text-pantas-muted">
          {article.sources.map((src, idx) => (
            <div key={idx} className="py-2 first:pt-1 last:pb-1">
              <p className="font-semibold text-pantas-dark">{src.institution}</p>
              <p className="italic">{src.documentTitle}</p>
              <p className="text-[11px] text-pantas-primary font-medium mt-0.5">{src.reviewDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA to start checkup */}
      <div className="p-5 bg-pantas-soft border border-pantas-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-pantas-dark">Ingin Memeriksa Faktor Risiko Anda?</h3>
          <p className="text-xs text-pantas-muted mt-0.5">
            Lakukan pemeriksaan awal mandiri dalam 2 menit tanpa biaya dan tanpa perlu login.
          </p>
        </div>
        <Link
          href="/pemeriksaan"
          className="px-4 py-2 bg-pantas-primary text-white text-xs font-medium rounded hover:bg-pantas-primary-hover shrink-0 transition-colors"
        >
          Mulai Pemeriksaan Mandiri
        </Link>
      </div>
    </article>
  );
}

