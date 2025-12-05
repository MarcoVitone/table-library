function toSentenceCase(str: string): string {
  const result = str.replaceAll(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}

export { toSentenceCase };
