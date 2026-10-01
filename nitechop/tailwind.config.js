module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    night: { 950: "#0B0D12", 900: "#12151D", 800: "#1A1F2B", 700: "#252C3B" },
    brand: { DEFAULT: "#34D399", deep: "#059669", glow: "#6EE7B7", dim: "#10231C" },
    mint: "#34D399", amber: "#FBBF24", alert: "#F87171" },
    boxShadow: { card: "0 4px 24px rgba(0,0,0,0.45)", glow: "0 0 20px rgba(52,211,153,0.30)" } } },
  plugins: [] };
