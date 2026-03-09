const GEORGIAN_SCRIPT_PATTERN = /[\u10A0-\u10FF]/;

const GEORGIAN_TO_LATIN: Record<string, string> = {
	ა: "a",
	ბ: "b",
	გ: "g",
	დ: "d",
	ე: "e",
	ვ: "v",
	ზ: "z",
	თ: "t",
	ი: "i",
	კ: "k",
	ლ: "l",
	მ: "m",
	ნ: "n",
	ო: "o",
	პ: "p",
	ჟ: "zh",
	რ: "r",
	ს: "s",
	ტ: "t",
	უ: "u",
	ფ: "p",
	ქ: "k",
	ღ: "gh",
	ყ: "q",
	შ: "sh",
	ჩ: "ch",
	ც: "ts",
	ძ: "dz",
	წ: "ts",
	ჭ: "ch",
	ხ: "kh",
	ჯ: "j",
	ჰ: "h",
};

function isGeorgian(languageId: string | null | undefined) {
	return languageId === "georgian";
}

export function hasGeorgianScript(value: string) {
	return GEORGIAN_SCRIPT_PATTERN.test(value);
}

export function transliterateGeorgian(value: string) {
	return Array.from(value)
		.map((character) => GEORGIAN_TO_LATIN[character] ?? character)
		.join("");
}

export function normalizePromptInput(
	languageId: string | null | undefined,
	value: string,
) {
	if (!isGeorgian(languageId)) {
		return value;
	}

	return transliterateGeorgian(value);
}

export function normalizePromptStorage(
	languageId: string | null | undefined,
	prompt: string,
	pronunciation = "",
) {
	const cleanedPrompt = prompt.trim();
	if (!isGeorgian(languageId)) {
		return cleanedPrompt;
	}

	const cleanedPronunciation = pronunciation.trim();
	if (cleanedPronunciation.length > 0) {
		return cleanedPronunciation;
	}

	return transliterateGeorgian(cleanedPrompt);
}

export function normalizeExampleStorage(
	languageId: string | null | undefined,
	example: string,
) {
	const cleanedExample = example.trim();
	if (!isGeorgian(languageId)) {
		return cleanedExample;
	}

	return transliterateGeorgian(cleanedExample);
}

export function getPromptDisplay(
	languageId: string | null | undefined,
	prompt: string,
	pronunciation = "",
) {
	if (!isGeorgian(languageId)) {
		return prompt;
	}

	return normalizePromptStorage(languageId, prompt, pronunciation);
}

export function getExampleDisplay(
	languageId: string | null | undefined,
	example: string,
) {
	if (!isGeorgian(languageId)) {
		return example;
	}

	return transliterateGeorgian(example);
}

export function getComparablePrompt(
	languageId: string | null | undefined,
	prompt: string,
	pronunciation = "",
) {
	return getPromptDisplay(languageId, prompt, pronunciation)
		.trim()
		.toLowerCase();
}
