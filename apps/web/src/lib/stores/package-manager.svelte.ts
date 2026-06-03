import { browser } from '$app/environment';
import {
	contentUiDefaults,
	availablePackageManagers,
	type PackageManagerOption
} from '$lib/config/content-ui';

export type PackageManager = PackageManagerOption;

const enabledManagers = Array.from(
	new Set(
		contentUiDefaults.packageManager.enabled.filter((pm): pm is PackageManager =>
			availablePackageManagers.includes(pm)
		)
	)
);

export const packageManagers: PackageManager[] =
	enabledManagers.length > 0 ? enabledManagers : ['npm'];

function createPackageManagerStore() {
	const configuredDefault = contentUiDefaults.packageManager.default;
	let active = $state<PackageManager>(
		packageManagers.includes(configuredDefault) ? configuredDefault : packageManagers[0]
	);

	if (browser) {
		const stored = localStorage.getItem(contentUiDefaults.packageManager.storageKey);
		if (stored && packageManagers.includes(stored as PackageManager)) {
			active = stored as PackageManager;
		}
	}

	return {
		get active() {
			return active;
		},
		set active(v: PackageManager) {
			active = v;
			if (browser) {
				localStorage.setItem(contentUiDefaults.packageManager.storageKey, v);
			}
		}
	};
}

export const packageManagerStore = createPackageManagerStore();
