//ClassNames utility function
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(value => Boolean(value)).join(" ");
}