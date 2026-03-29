declare module 'text-readability' {
  export function fleschReadingEase(text: string): number;
  export function fleschKincaidGrade(text: string): number;
  export function smogIndex(text: string): number;
  export function colemanLiauIndex(text: string): number;
  export function automatedReadabilityIndex(text: string): number;
  export function daleChallReadabilityScore(text: string): number;
  export function difficulties(text: string): string[];
}
