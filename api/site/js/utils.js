export function generateHash(length) {
  if (length <= 0 || length > 25 || !Number.isInteger(length)) {
    throw new Error(`The length has to be a positive integer between 1 and 25. The given value is: ${length}`);
  }
  const seq = '0a1b2c3d4e5f6g7h8i9j0kAlBmCnDoEpFqGrHsItJuKvLwMxNyOzPQRSTUVWXYZ';
  let res = [];
  while (res.length < length) {
    let randIndex = Math.floor(Math.random() * seq.length);
    res.push(seq[randIndex]);
  }
  return res.join('');
}
