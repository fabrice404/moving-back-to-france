
export const colors = [
  "#c70000",
  "#c61d00",
  "#c62d00",
  "#c43900",
  "#c24400",
  "#c04d00",
  "#be5600",
  "#ba5f00",
  "#b66700",
  "#b16f00",
  "#ad7600",
  "#a87d00",
  "#a48300",
  "#9e8a00",
  "#999000",
  "#939600",
  "#8c9c00",
  "#85a200",
  "#7ea800",
  "#75ad00",
  "#6bb300",
  "#5fb900",
  "#51be00",
  "#40c300",
  "#28c800",
];

export const getScoreColorHex = (score: number) => {
  if (score >= 100) {
    return colors[colors.length - 1];
  }
  if (score < 0) {
    return colors[0];
  }

  return colors[Math.floor(score / 4)];
};


export const getScoreColorText = (score: number) => {
  if (score >= 80) {
    return "success";
  }
  if (score >= 60) {
    return "warning";
  }

  return "danger";
};
