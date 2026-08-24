import {
  MapPinIcon,
  LitterIcon,
  AlertTriangleIcon,
  BrokenIcon,
  TruckIcon,
  SortingIcon,
  ComplaintIcon,
} from "@/components/icons";

export interface ProblemTypeVisual {
  Icon: typeof MapPinIcon;
  bgClassName: string;
  colorClassName: string;
}

const DEFAULT_VISUAL: ProblemTypeVisual = {
  Icon: ComplaintIcon,
  bgClassName: "bg-secondary-100",
  colorClassName: "text-secondary-700",
};

/** Ключові слова в темі звернення → іконка й колір типу проблеми на картці завдання. */
const RULES: { keywords: string[]; visual: ProblemTypeVisual }[] = [
  {
    keywords: ["переповнен"],
    visual: {
      Icon: MapPinIcon,
      bgClassName: "bg-red-100",
      colorClassName: "text-red-700",
    },
  },
  {
    keywords: ["запах"],
    visual: {
      Icon: AlertTriangleIcon,
      bgClassName: "bg-orange-100",
      colorClassName: "text-orange-700",
    },
  },
  {
    keywords: ["пошкоджен"],
    visual: {
      Icon: BrokenIcon,
      bgClassName: "bg-gray-200",
      colorClassName: "text-gray-700",
    },
  },
  {
    keywords: ["графік"],
    visual: {
      Icon: TruckIcon,
      bgClassName: "bg-violet-100",
      colorClassName: "text-violet-700",
    },
  },
  {
    keywords: ["захаращен"],
    visual: {
      Icon: SortingIcon,
      bgClassName: "bg-teal-100",
      colorClassName: "text-teal-700",
    },
  },
  {
    keywords: ["сміття", "звалище"],
    visual: {
      Icon: LitterIcon,
      bgClassName: "bg-amber-100",
      colorClassName: "text-amber-700",
    },
  },
];

export function problemTypeVisualFor(subject: string): ProblemTypeVisual {
  const normalized = subject.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.visual;
    }
  }
  return DEFAULT_VISUAL;
}
