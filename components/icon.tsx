type IconName =
  | "code"
  | "people"
  | "project"
  | "trophy"
  | "flag"
  | "calendar"
  | "user"
  | "mail"
  | "pin"
  | "phone"
  | "github"
  | "linkedin"
  | "instagram"
  | "youtube"
  | "close";
export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    code: <path d="m7 3-4 9 4 9m10-18 4 9-4 9M14 2l-4 20" />,
    people: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M8 21v-7h8v7M5 9a2.5 2.5 0 1 0-2.5-2.5M2 19v-6h4m13-4a2.5 2.5 0 1 1 2.5-2.5M22 19v-6h-4" />
      </>
    ),
    project: <path d="m3 8 5 5 4-4 5 5 4-5M3 8v6m18-5v6" />,
    trophy: (
      <path d="M7 3h10v5c0 4-2 6-5 6s-5-2-5-6V3ZM7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4M12 14v5m-5 2h10m-8-2h6" />
    ),
    flag: <path d="M5 22V3l7 2 7-1v10l-7 1-7-2" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 2v6m10-6v6M3 11h18" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 21v-3a7 7 0 0 1 14 0v3H5Z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    phone: (
      <path d="m5 3 4 4-2 3c1 3 4 6 7 7l3-2 4 4-3 3C10 22 2 14 2 6l3-3Z" />
    ),
    github: (
      <path d="M9 21v-4c-4 1-4-2-6-2m12 6v-4c0-2 2-2 3-4 2-4 0-6-1-7l-1-4-4 2-4-2-1 4c-2 1-3 3-1 7 1 2 3 2 3 4" />
    ),
    linkedin: (
      <>
        <path d="M5 9v12M10 21V9h4v2c4-4 7-1 7 3v7m-7 0v-7" />
        <circle cx="5" cy="4" r="1" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    youtube: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
