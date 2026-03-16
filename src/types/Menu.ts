export type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  hidden?: boolean;
  submenu?: Menu[];
};
