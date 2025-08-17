export type StateCode = 'VA' | 'NC';

export interface ComplianceChecklistItem {
	id: string;
	label: string;
	category: 'licensing' | 'permits' | 'standards' | 'safety' | 'environment' | 'transport' | 'tax' | 'insurance';
	required: boolean;
}

export interface StateComplianceProfile {
	state: StateCode;
	name: string;
	items: ComplianceChecklistItem[];
}

export const VA_PROFILE: StateComplianceProfile = {
	state: 'VA',
	name: 'Virginia',
	items: [
		{ id: 'va-entity', label: 'Register/maintain entity (SCC)', category: 'licensing', required: true },
		{ id: 'va-dpor', label: 'DPOR contractor license (classification/limit)', category: 'licensing', required: true },
		{ id: 'va-bpol', label: 'Local BPOL license (if applicable)', category: 'licensing', required: false },
		{ id: 'va-vdot-permit', label: 'VDOT ROW/encroachment permit (as needed)', category: 'permits', required: false },
		{ id: 'va-traffic', label: 'MUTCD/VDOT traffic control plan', category: 'standards', required: true },
		{ id: 'va-standards', label: 'VDOT specs for mix/placement/QC', category: 'standards', required: true },
		{ id: 'va-vosh', label: 'VOSH/OSHA safety programs and training', category: 'safety', required: true },
		{ id: 'va-deq', label: 'DEQ stormwater/BMPs; waste handling', category: 'environment', required: true },
		{ id: 'va-transport', label: 'DOT numbers/CDL/permits if applicable', category: 'transport', required: false },
		{ id: 'va-tax', label: 'VA Tax registrations (sales/use, withholding)', category: 'tax', required: true },
		{ id: 'va-ins', label: 'GL/Auto/Equip/Workers’ Comp; COIs', category: 'insurance', required: true },
	],
};

export const NC_PROFILE: StateComplianceProfile = {
	state: 'NC',
	name: 'North Carolina',
	items: [
		{ id: 'nc-entity', label: 'Register/maintain entity (SOS)', category: 'licensing', required: true },
		{ id: 'nc-lbgc', label: 'NCLBGC license (value threshold/class)', category: 'licensing', required: true },
		{ id: 'nc-local', label: 'Local privilege/business license (if any)', category: 'licensing', required: false },
		{ id: 'nc-ncdot-permit', label: 'NCDOT encroachment/driveway permit', category: 'permits', required: false },
		{ id: 'nc-traffic', label: 'MUTCD/NCDOT traffic control plan', category: 'standards', required: true },
		{ id: 'nc-standards', label: 'NCDOT specs for mix/placement/QC', category: 'standards', required: true },
		{ id: 'nc-osh', label: 'NC OSH safety programs and training', category: 'safety', required: true },
		{ id: 'nc-deq', label: 'NCDEQ stormwater/BMPs; waste handling', category: 'environment', required: true },
		{ id: 'nc-transport', label: 'DOT numbers/CDL/permits if applicable', category: 'transport', required: false },
		{ id: 'nc-tax', label: 'NC DOR registrations (sales/use, withholding)', category: 'tax', required: true },
		{ id: 'nc-ins', label: 'GL/Auto/Equip/Workers’ Comp; COIs', category: 'insurance', required: true },
	],
};

export function getComplianceProfile(state: StateCode): StateComplianceProfile {
	return state === 'VA' ? VA_PROFILE : NC_PROFILE;
}

