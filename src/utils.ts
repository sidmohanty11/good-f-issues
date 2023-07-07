import { formatDistanceToNowStrict } from "date-fns";
import locale from "date-fns/locale/en-US";

const formatDistanceLocale = {
  lessThanXSeconds: "just now",
  xSeconds: "just now",
  halfAMinute: "just now",
  lessThanXMinutes: "{{count}}minutes",
  xMinutes: "{{count}}minutes",
  aboutXHours: "{{count}}hours",
  xHours: "{{count}}hours",
  xDays: "{{count}}days",
  aboutXWeeks: "{{count}}weeks",
  xWeeks: "{{count}}weeks",
  aboutXMonths: "{{count}}months",
  xMonths: "{{count}}months",
  aboutXYears: "{{count}}years",
  xYears: "{{count}}years",
  overXYears: "{{count}}years",
  almostXYears: "{{count}}years",
};

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {};

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace("{{count}}", count.toString());

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return "in " + result;
    } else {
      if (result === "just now") return result;
      return result + " ago";
    }
  }

  return result;
}

export function formatTimeToNow(timestamp: string): string {
  const date = new Date(timestamp);
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
}

