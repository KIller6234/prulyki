import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Крапля-листок — логотип. */
export function LeafDropletIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3c-4.2 3-6.5 6.8-6.5 10.2a6.5 6.5 0 0 0 13 0C18.5 9.8 16.2 6 12 3Z" />
      <path d="M9.2 14.2a3.6 3.6 0 0 0 5.2-3.2" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  );
}

/** Правила сортування — контейнер з галочкою. */
export function SortingIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="m9.5 13 2 2 3.5-3.5" />
    </svg>
  );
}

/** Графіки вивезення — календар. */
export function ScheduleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16" />
      <path d="M8 3.5v3.5M16 3.5v3.5" />
      <path d="M8.5 14h2M13.5 14h2M8.5 17h2" />
    </svg>
  );
}

/** Мапа майданчиків — шпилька на мапі. */
export function MapPinIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 21s-6.5-5.8-6.5-10.8A6.5 6.5 0 0 1 18.5 10.2C18.5 15.2 12 21 12 21Z" />
      <circle cx="12" cy="10.2" r="2.3" />
    </svg>
  );
}

/** Звернення — мовна бульбашка з рядками тексту. */
export function ComplaintIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" />
      <path d="M8 8.5h8M8 12h5" />
    </svg>
  );
}

/** ШІ-консультант / аватар — робот-бульбашка. */
export function ChatBubbleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="5" y="6" width="14" height="10" rx="3" />
      <path d="M12 6V3.7M9.5 3.7h5" />
      <circle cx="9.3" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="11" r="1" fill="currentColor" stroke="none" />
      <path d="M9 19.5 11.3 16h1.4l2.3 3.5" />
    </svg>
  );
}

/** Локація користувача — приціл/геолокація. */
export function LocationIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    </svg>
  );
}

/** Стрілка розкриття select. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Надіслати повідомлення — паперовий літачок. */
export function SendIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeLinejoin="round" strokeWidth={1.8}>
      <path d="M4.5 11.5 20 4l-6.2 15.5-2.6-6.2-6.2-1.8Z" />
      <path d="m11.2 13.3 3.7-3.7" />
    </svg>
  );
}

/** Закрити. */
export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Управління персоналом — двоє людей. */
export function UsersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.8 12.2c2.2.3 3.7 1.9 3.7 4.3" />
    </svg>
  );
}

/** Оголошення — мегафон. */
export function MegaphoneIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l1 5h2l-1-5h1l8 4V6.5l-8 4H5.5A1.5 1.5 0 0 0 4 10.5Z" />
      <path d="M19 9.5a4 4 0 0 1 0 5" />
    </svg>
  );
}

/** Аналітика — стовпчикова діаграма. */
export function BarChartIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M20 20H4" />
    </svg>
  );
}

/** Журнал аудиту — документ зі списком. */
export function AuditLogIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 3.5h9l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V5A1.5 1.5 0 0 1 6 3.5Z" />
      <path d="M8.5 10h7M8.5 13.2h7M8.5 16.4h4.5" />
    </svg>
  );
}

/** Сповіщення — дзвіночок. */
export function BellIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.3 1.5 5.3H4.5S6 14 6 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

/** Підтримка — гарнітура. */
export function HeadsetIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v.5A2.5 2.5 0 0 1 16.5 22H13" />
    </svg>
  );
}

/** Час — годинник. */
export function ClockIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

/** Довідка / підказка. */
export function InfoIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Редагувати — олівець. */
export function EditIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 20l.9-3.9L15.6 5.4a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L8 19.1 4 20Z" />
      <path d="m14 6.8 3.2 3.2" />
    </svg>
  );
}

/** Додати. */
export function PlusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Тренд угору. */
export function TrendUpIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M4 16.5 10 10l4 4 6-7.5" />
      <path d="M15 6.5h5V11" />
    </svg>
  );
}

/** Тренд униз. */
export function TrendDownIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M4 7.5 10 14l4-4 6 7.5" />
      <path d="M15 17.5h5V13" />
    </svg>
  );
}

/** Попередження (деактивація). */
export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4 21.5 20H2.5Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Вирішено — коло з галочкою. */
export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.3 2.3 4.7-5" />
    </svg>
  );
}

/** Панель — сітка віджетів. */
export function GridIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

/** Маршрути — сміттєвоз. */
export function TruckIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 7.5h10v9H3z" />
      <path d="M13 11h4.5l3 3v2.5H13z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </svg>
  );
}

/** Налаштування — шестерня. */
export function GearIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6M17.8 17.8l-1.6-1.6M7.8 7.8 6.2 6.2" />
    </svg>
  );
}

/** Фільтри — повзунки. */
export function FilterIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8.5" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Швидка дія — блискавка. */
export function LightningIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeLinejoin="round">
      <path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13L12.5 3Z" />
    </svg>
  );
}

/** Перейти далі — стрілка вправо. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

/** Назад — стрілка вліво. */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </svg>
  );
}

/** Вийти — двері зі стрілкою. */
export function LogoutIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H10" />
      <path d="M14.5 8.5 19 12l-4.5 3.5M19 12H9.5" />
    </svg>
  );
}

/** Мої завдання — планшет зі списком. */
export function ChecklistIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
      <path d="M8.5 8.2 9.8 9.5l2.3-2.3M8.5 14.2l1.3 1.3 2.3-2.3" />
      <path d="M13.5 8.5h4M13.5 14.5h4" />
    </svg>
  );
}

/** Фото — камера. */
export function CameraIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

/** Копіювати. */
export function CopyIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="8.5" y="8.5" width="11" height="12" rx="1.8" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v9A1.5 1.5 0 0 0 6 16.5h2.5" />
    </svg>
  );
}

/** Мінус — степер. */
export function MinusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} strokeWidth={2}>
      <path d="M5 12h14" />
    </svg>
  );
}

/** Розкидане сміття / стихійне звалище. */
export function LitterIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 8.5h10l-.9 9.5a1.8 1.8 0 0 1-1.8 1.6H9.7a1.8 1.8 0 0 1-1.8-1.6L7 8.5Z" />
      <path d="M5 8.5h14M10 5.5h4l.7 3H9.3l.7-3Z" />
      <path d="m10.5 11.5.4 5M13.5 11.5l-.4 5" />
    </svg>
  );
}

/** Пошкоджений контейнер. */
export function BrokenIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 8h6.5l-1.7 3.2L12 13l-2 3.3L11 18H5.5A1.5 1.5 0 0 1 4 16.6L5 8Z" />
      <path d="M14 8h5l-1 8.6a1.5 1.5 0 0 1-1.5 1.4H14" />
      <path d="M6.5 5.5h11" />
    </svg>
  );
}
