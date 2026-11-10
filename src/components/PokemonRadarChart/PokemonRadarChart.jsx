import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Box } from '@mui/material';
import { STAT_KEYS } from '../../api/pokeapi.js';

// Graphique radar purement présentational.
// `series` : [{ name, color, stats: { hp, attack, … } }] ; `labels` : { hp: 'PV', … }
const PokemonRadarChart = ({ series = [], labels = {}, height = 340 }) => {
  const usable = series.filter((entry) => entry?.stats);
  if (usable.length === 0) return null;

  const data = STAT_KEYS.map((key) => {
    const row = { subject: labels[key] || key.toUpperCase() };
    usable.forEach((entry, index) => {
      row[`s${index}`] = entry.stats[key] ?? 0;
    });
    return row;
  });

  // L'échelle s'adapte aux stats extrêmes (ex. 250 PV) sans écraser les profils moyens.
  const highest = Math.max(...usable.flatMap((entry) => STAT_KEYS.map((key) => entry.stats[key] ?? 0)));
  const domainMax = Math.max(140, Math.ceil(highest / 20) * 20);

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="74%" data={data}>
          <PolarGrid stroke="var(--border-strong)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />

          {usable.map((entry, index) => (
            <Radar
              key={entry.name}
              name={entry.name}
              dataKey={`s${index}`}
              stroke={entry.color}
              strokeWidth={2}
              fill={entry.color}
              fillOpacity={0.28}
              isAnimationActive={false}
            />
          ))}

          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-strong)',
              borderRadius: 12,
              color: 'var(--text)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.85rem',
            }}
            labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
            itemStyle={{ padding: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PokemonRadarChart;
