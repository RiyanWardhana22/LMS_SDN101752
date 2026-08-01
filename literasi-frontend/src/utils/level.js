/**
 * Helper untuk menghitung level siswa berdasarkan XP
 * Dapat digunakan di Prestasi.jsx dan ProfilSiswa.jsx
 */

export const LEVEL_CONFIG = [
  { level: 1, min: 0,    max: 100,  icon: "🌱", label: "Benih Ilmu",       nextXP: 100  },
  { level: 2, min: 101,  max: 300,  icon: "🌿", label: "Tunas Cerdas",      nextXP: 300  },
  { level: 3, min: 301,  max: 600,  icon: "🌳", label: "Pohon Pengetahuan", nextXP: 600  },
  { level: 4, min: 601,  max: 1000, icon: "⭐", label: "Bintang Literasi",  nextXP: 1000 },
  { level: 5, min: 1001, max: 1500, icon: "🚀", label: "Penjelajah Ilmu",   nextXP: 1500 },
  { level: 6, min: 1501, max: Infinity, icon: "👑", label: "Juara Belajar", nextXP: null },
];

/**
 * Mendapatkan informasi level berdasarkan XP
 * @param {number} xp - Total XP siswa
 * @returns {{ level: number, icon: string, label: string, currentMin: number, nextThreshold: number|null, percent: number, isMax: boolean }}
 */
export function getLevel(xp) {
  const config = LEVEL_CONFIG.find((l) => xp >= l.min && xp <= l.max) || LEVEL_CONFIG[0];
  const progressInLevel = xp - config.min;
  const rangeInLevel = config.nextXP ? config.max - config.min : 1;
  const percent = config.nextXP ? Math.min((progressInLevel / rangeInLevel) * 100, 100) : 100;
  return {
    ...config,
    currentMin: config.min,
    percent,
    isMax: config.nextXP === null,
  };
}