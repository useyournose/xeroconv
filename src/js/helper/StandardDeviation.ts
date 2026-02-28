export function StandardDeviation(arr:number[]):number {
  // thanks https://www.geeksforgeeks.org/how-to-get-the-standard-deviation-of-an-array-of-numbers-using-javascript/
  // Creating the mean with Array.reduce
  const mean = arr.reduce((acc, curr) => {
    return acc + curr;
  }, 0) / arr.length;
  // Assigning (value - mean) ^ 2 to
  // every array item
  arr = arr.map((k) => {
    return (k - mean) ** 2;
  });
  // Calculating the sum of updated array 
  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  // Calculating the variance
  const variance = sum / arr.length;
  // Returning the standard deviation
  return Math.sqrt(sum / arr.length);
}


export function stddev(arr: number[], mu: number): number {
  return Math.sqrt(arr.reduce((s, x) => s + (x - mu) ** 2, 0) / arr.length);
}
