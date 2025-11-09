import { SPFI } from "@pnp/sp";

export interface ICustomQuickLinksProps {
  Title: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  PagUrl: string; // إضافة خاصية عنوان القائمة
  context: any; // إضافة السياق
  Lang: string;
  designStyle: string;
  sp: SPFI;
}
