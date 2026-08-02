// src/utils/subjectThemes.js
export const SUBJECT_THEMES = {
  "Matematika": { color: "#4ECDC4", shadowColor: "#30B5AC", icon: "➗" },
  "IPA": { color: "#2ECC71", shadowColor: "#27AE60", icon: "🔬" },
  "Bahasa Indonesia": { color: "#FF6B9D", shadowColor: "#C2185B", icon: "📖" },
  "IPS": { color: "#E67E22", shadowColor: "#D35400", icon: "🌍" },
  "PKn": { color: "#E74C3C", shadowColor: "#C0392B", icon: "🇮🇩" },
  "Agama": { color: "#9B59B6", shadowColor: "#7D3C98", icon: "🕌" },
  "SBdP": { color: "#F39C12", shadowColor: "#D68910", icon: "🎨" },
  "PJOK": { color: "#1ABC9C", shadowColor: "#148F77", icon: "⚽" },
  default: { color: "#3498DB", shadowColor: "#2980B9", icon: "📚" }
};

export function getSubjectTheme(mapel) {
  // Cari yang cocok (exact match)
  if (SUBJECT_THEMES[mapel]) {
    return SUBJECT_THEMES[mapel];
  }
  
  // Cari partial match
  const key = Object.keys(SUBJECT_THEMES).find((k) =>
    mapel.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(mapel.toLowerCase())
  );
  
  return key ? SUBJECT_THEMES[key] : SUBJECT_THEMES.default;
}