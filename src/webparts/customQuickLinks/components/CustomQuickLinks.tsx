import * as React from "react";
import { useEffect, useState } from "react";
import { ICustomQuickLinksProps } from "./ICustomQuickLinksProps";
import styles from "./CustomQuickLinks.module.scss";
import LinkCard from "./LinkCard";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { SPFx, Web } from "@pnp/sp/presets/all";
import WebPartWrapper from "../../announcementWebPart/components/WebPartWrapper/WebPartWrapper";

interface ILinkItem {
  id: number;
  title: string;
  url: string;
  description: string;
  icon: string;
}

const CustomQuickLinks: React.FC<ICustomQuickLinksProps> = (props) => {
  const [links, setLinks] = useState<ILinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const getLinksFromList = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const web = Web(props.PagUrl).using(SPFx(props.context));
      const items2: ILinkItem[] = await web.lists
        .getByTitle("QuickLinks")
        .items.select("Id,Title,Description,Icon,URL")();

      const mapped: ILinkItem[] = items2.map((item: any) => ({
        id: item.Id,
        title: item.Title,
        url: item.URL?.Url || "",
        description: item.Description || "",
        icon: item.Icon || "🔗",
      }));

      setLinks(mapped);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError("فشل في جلب البيانات من قائمة الروابط السريعة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLinksFromList();
  }, [props.PagUrl]);

  return (
    <WebPartWrapper
      title={props.Title || "🔗 الروابط السريعة"}
      loading={loading}
      error={error}
    >
      <div
        id="CanvasZone"
        className={`${styles.customQuickLinks} ${
          props.designStyle === "list"
            ? styles.linksList
            : props.designStyle === "cards"
            ? styles.linksCards
            : styles.linksGrid
        }`}
      >
        {links.length > 0 ? (
          links.map((link) => (
            <LinkCard
              key={link.id}
              title={link.title}
              description={link.description}
              icon={link.icon}
              url={link.url}
            />
          ))
        ) : (
          <div className={styles.noLinks}>
            <p>لا توجد روابط متاحة</p>
          </div>
        )}
      </div>
    </WebPartWrapper>
  );
};

export default CustomQuickLinks;
