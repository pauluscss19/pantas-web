'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { EvaluationResult } from '@/lib/types';
import { Droplet, Heart } from 'lucide-react';

interface TrendChartsProps {
  checkups: EvaluationResult[];
}

export function TrendCharts({ checkups }: TrendChartsProps) {
  const [glucoseSubTab, setGlucoseSubTab] = useState<'gdp' | 'gds'>('gdp');

  // Filter and sort ascending by date for charts
  const sorted = [...checkups].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Prepare GDP data
  const gdpData = sorted
    .filter((c) => c.checkupType === 'diabetes' && c.rawInput?.hasTestedGlucose && c.rawInput?.testType === 'gdp')
    .map((c) => ({
      date: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      nilai: Number(c.rawInput?.glucoseValue),
      fasting: c.rawInput?.fasting8Hours ? 'Puasa ≥8 Jam' : 'Belum Puasa',
    }))
    .filter((d) => !isNaN(d.nilai) && d.nilai > 0);

  // Prepare GDS data
  const gdsData = sorted
    .filter((c) => c.checkupType === 'diabetes' && c.rawInput?.hasTestedGlucose && c.rawInput?.testType === 'gds')
    .map((c) => ({
      date: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      nilai: Number(c.rawInput?.glucoseValue),
    }))
    .filter((d) => !isNaN(d.nilai) && d.nilai > 0);

  // Prepare Blood Pressure data
  const bpData = sorted
    .filter((c) => c.checkupType === 'hipertensi' && c.rawInput?.hasTestedBP)
    .map((c) => ({
      date: new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      sistolik: Number(c.rawInput?.systolic),
      diastolik: Number(c.rawInput?.diastolic),
    }))
    .filter((d) => !isNaN(d.sistolik) && !isNaN(d.diastolik) && d.sistolik > 0 && d.diastolik > 0);

  return (
    <div className="space-y-6">
      {/* 1. GRAFIK TEKANAN DARAH */}
      <div className="p-5 bg-white border border-pantas-border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-pantas-soft flex items-center justify-center text-pantas-primary">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-pantas-dark">
                Tren Tekanan Darah (Sistolik & Diastolik)
              </h3>
              <p className="text-xs text-pantas-muted">
                Batas rujukan normal: Sistolik &lt;140 mmHg dan Diastolik &lt;90 mmHg.
              </p>
            </div>
          </div>
          <span className="text-xs text-pantas-muted bg-pantas-bg px-2.5 py-1 rounded border border-pantas-border">
            Total {bpData.length} data pengukuran
          </span>
        </div>

        {bpData.length >= 2 ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bpData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5B665E' }} />
                <YAxis
                  domain={[40, 200]}
                  tick={{ fontSize: 12, fill: '#5B665E' }}
                  unit=" mmHg"
                />
                <Tooltip
                  formatter={(val: any, name?: any) => [
                    `${val} mmHg`,
                    name === 'sistolik' ? 'Sistolik' : 'Diastolik',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #D3DDD3',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'sistolik' ? 'Sistolik (mmHg)' : 'Diastolik (mmHg)')}
                />
                <ReferenceLine
                  y={140}
                  label={{ value: 'Batas Sistolik 140', fill: '#DC2626', fontSize: 10, position: 'top' }}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  y={90}
                  label={{ value: 'Batas Diastolik 90', fill: '#D97706', fontSize: 10, position: 'top' }}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="sistolik"
                  stroke="#006837"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#006837' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolik"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0D9488' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center bg-pantas-bg rounded border border-pantas-border/70 text-xs text-pantas-muted space-y-1">
            <p className="font-semibold text-pantas-dark">Belum Cukup Data untuk Membuat Grafik Tekanan Darah</p>
            <p>Dibutuhkan minimal 2 riwayat pengukuran tekanan darah untuk menampilkan grafik garis perkembangan.</p>
          </div>
        )}
      </div>

      {/* 2. GRAFIK GULA DARAH (DIPISAHKAN GDP DAN GDS SECARA TEGAS) */}
      <div className="p-5 bg-white border border-pantas-border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-pantas-soft flex items-center justify-center text-pantas-primary">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-pantas-dark">
                Tren Gula Darah (GDP & GDS Terpisah)
              </h3>
              <p className="text-xs text-pantas-muted">
                Jenis tes puasa dan sewaktu memiliki standar rujukan berbeda dan tidak digabung.
              </p>
            </div>
          </div>

          {/* Sub tabs: GDP vs GDS */}
          <div className="flex items-center gap-1 bg-pantas-bg p-1 rounded border border-pantas-border">
            <button
              onClick={() => setGlucoseSubTab('gdp')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                glucoseSubTab === 'gdp'
                  ? 'bg-pantas-primary text-white shadow-xs'
                  : 'text-pantas-muted hover:text-pantas-dark'
              }`}
            >
              Gula Darah Puasa (GDP) ({gdpData.length})
            </button>
            <button
              onClick={() => setGlucoseSubTab('gds')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                glucoseSubTab === 'gds'
                  ? 'bg-pantas-primary text-white shadow-xs'
                  : 'text-pantas-muted hover:text-pantas-dark'
              }`}
            >
              Gula Darah Sewaktu (GDS) ({gdsData.length})
            </button>
          </div>
        </div>

        {glucoseSubTab === 'gdp' ? (
          gdpData.length >= 2 ? (
            <div className="space-y-2">
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gdpData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5B665E' }} />
                    <YAxis domain={[50, 250]} tick={{ fontSize: 12, fill: '#5B665E' }} unit=" mg/dL" />
                    <Tooltip
                      formatter={(val: any) => [`${val} mg/dL`, 'Gula Darah Puasa (GDP)']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #D3DDD3',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend formatter={() => 'Gula Darah Puasa / GDP (mg/dL)'} />
                    <ReferenceLine
                      y={100}
                      label={{ value: 'Batas Normal 100', fill: '#D97706', fontSize: 10, position: 'top' }}
                      stroke="#D97706"
                      strokeDasharray="4 4"
                    />
                    <ReferenceLine
                      y={126}
                      label={{ value: 'Ambang Tinggi 126', fill: '#DC2626', fontSize: 10, position: 'top' }}
                      stroke="#DC2626"
                      strokeDasharray="4 4"
                    />
                    <Line
                      type="monotone"
                      dataKey="nilai"
                      stroke="#006837"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#006837' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-pantas-muted">
                Rujukan GDP PERKENI: Normal &lt;100 mg/dL, Prediabetes 100–125 mg/dL, Tinggi ≥126 mg/dL.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center bg-pantas-bg rounded border border-pantas-border/70 text-xs text-pantas-muted space-y-1">
              <p className="font-semibold text-pantas-dark">Belum Cukup Data untuk Grafik GDP</p>
              <p>Dibutuhkan minimal 2 catatan tes Gula Darah Puasa (GDP) untuk menampilkan tren.</p>
            </div>
          )
        ) : gdsData.length >= 2 ? (
          <div className="space-y-2">
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gdsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#5B665E' }} />
                  <YAxis domain={[50, 350]} tick={{ fontSize: 12, fill: '#5B665E' }} unit=" mg/dL" />
                  <Tooltip
                    formatter={(val: any) => [`${val} mg/dL`, 'Gula Darah Sewaktu (GDS)']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #D3DDD3',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend formatter={() => 'Gula Darah Sewaktu / GDS (mg/dL)'} />
                  <ReferenceLine
                    y={200}
                    label={{ value: 'Ambang Waspada GDS 200', fill: '#DC2626', fontSize: 10, position: 'top' }}
                    stroke="#DC2626"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="nilai"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#D97706' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-pantas-muted">
              Rujukan GDS PERKENI: Nilai ≥200 mg/dL memerlukan evaluasi tenaga kesehatan. GDS &lt;200 mg/dL tidak otomatis berarti bebas diabetes.
            </p>
          </div>
        ) : (
          <div className="p-8 text-center bg-pantas-bg rounded border border-pantas-border/70 text-xs text-pantas-muted space-y-1">
            <p className="font-semibold text-pantas-dark">Belum Cukup Data untuk Grafik GDS</p>
            <p>Dibutuhkan minimal 2 catatan tes Gula Darah Sewaktu (GDS) untuk menampilkan tren.</p>
          </div>
        )}
      </div>
    </div>
  );
}

