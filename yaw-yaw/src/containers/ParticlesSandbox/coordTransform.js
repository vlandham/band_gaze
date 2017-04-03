// translate coordinate from [-1, 1] to [0, width] and similar for y
export function toPixelSpace([x, y], width, height) {
  return [
    ((x / 2) + 0.5) * width,
    ((y / 2) + 0.5) * height,
  ];
}

// translate from [0, width] to [-1, 1] and similar for y
export function toNormalSpace([x, y], width, height) {
  return [
    2 * ((x / width) - 0.5),
    2 * ((y / height) - 0.5),
  ];
}

export function toNormalSpaceDelta([x, y], width, height) {
  return [
    2 * ((x / width) - 0.5) - -1,
    2 * ((y / height) - 0.5) - -1,
  ];
}
