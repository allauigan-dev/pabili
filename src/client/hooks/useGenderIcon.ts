import type { LucideIcon } from 'lucide-react';
import { User, UserRound } from 'lucide-react';

export type Gender = 'male' | 'female' | null | undefined;

interface GenderIconConfig {
    icon: LucideIcon;
    label: string;
}

interface GenderImagePaths {
    /** Small icons (32x32, 48x48) - suitable for favicons, small avatars */
    small: string;
    /** Medium icons (96x96, 128x128) - suitable for cards, list items */
    medium: string;
    /** Large icons (192x192, 256x256) - suitable for profile headers */
    large: string;
    /** Extra large icons (512x512) - suitable for splash screens, hero sections */
    xlarge: string;
}

const genderIcons: Record<'male' | 'female' | 'default', GenderIconConfig> = {
    male: {
        icon: User,
        label: 'Male',
    },
    female: {
        icon: UserRound,
        label: 'Female',
    },
    default: {
        icon: User,
        label: 'Not specified',
    },
};

/**
 * Get gender-based image paths for icons
 * @param gender - The gender value ('male', 'female', or null/undefined)
 * @returns Object containing various size icon paths
 */
export function getGenderImagePaths(gender: Gender): GenderImagePaths {
    const folder = gender === 'female' ? 'female' : 'male';

    return {
        small: `/${folder}/ios/32.png`,
        medium: `/${folder}/android/android-launchericon-96-96.png`,
        large: `/${folder}/android/android-launchericon-192-192.png`,
        xlarge: `/${folder}/ios/512.png`,
    };
}

/**
 * Hook to get gender-based icon and label
 * @param gender - The gender value ('male', 'female', or null/undefined)
 * @returns Object containing the icon component and label
 */
export function useGenderIcon(gender: Gender): GenderIconConfig {
    if (gender === 'male' || gender === 'female') {
        return genderIcons[gender];
    }
    return genderIcons.default;
}

/**
 * Hook to get gender-based icon, label, and image paths
 * @param gender - The gender value ('male', 'female', or null/undefined)
 * @returns Object containing the icon component, label, and image paths
 */
export function useGenderAssets(gender: Gender): GenderIconConfig & { images: GenderImagePaths } {
    const iconConfig = useGenderIcon(gender);
    const images = getGenderImagePaths(gender);

    return {
        ...iconConfig,
        images,
    };
}

/**
 * Get gender icon component directly (non-hook version for simpler use cases)
 */
export function getGenderIcon(gender: Gender): LucideIcon {
    if (gender === 'male' || gender === 'female') {
        return genderIcons[gender].icon;
    }
    return genderIcons.default.icon;
}

/**
 * Gender options for select/radio inputs
 */
export const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
] as const;

