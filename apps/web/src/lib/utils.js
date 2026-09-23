import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// News titles synced from the source site arrive in ALL CAPS, which reads as
// shouting and hurts CTR in Google search results — convert to sentence case
// (leaving already-mixed-case titles untouched).
export function formatNewsTitle(title) {
	if (!title) return title;
	const hasLetters = /[A-Za-zÀ-ỹ]/.test(title);
	if (!hasLetters || title !== title.toUpperCase()) return title;
	const sentenceCased = title.toLowerCase().replace(/^./, (c) => c.toUpperCase());
	return sentenceCased.replace(/vinfast/gi, "VinFast");
}
